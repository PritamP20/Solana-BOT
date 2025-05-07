use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    program::invoke,
    system_instruction,
};

// Define the chess piece types
#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
    Empty,
}

// Define the chess piece colors
#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum PieceColor {
    White,
    Black,
    None,
}

// Define a chess piece
#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, Debug)]
pub struct Piece {
    piece_type: PieceType,
    color: PieceColor,
}

// Define the game status
#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, PartialEq, Debug)]
pub enum GameStatus {
    Active,
    CheckWhite,
    CheckBlack,
    CheckmateWhite,
    CheckmateBlack,
    Draw,
    Abandoned,
}

// Define a chess move
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
pub struct Move {
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8,
    piece: Piece,
    captured_piece: Option<Piece>,
    is_castling: bool,
    is_en_passant: bool,
    promotion_piece: Option<PieceType>,
}

// Define the game state
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GameState {
    board: [[Piece; 8]; 8],
    current_turn: PieceColor,
    white_player: Pubkey,
    black_player: Pubkey,
    game_status: GameStatus,
    move_history: Vec<Move>,
}

// Define the instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum ChessInstruction {
    // Initialize a new game
    InitGame { white_player: Pubkey, black_player: Pubkey },
    // Make a move
    MakeMove { from_x: u8, from_y: u8, to_x: u8, to_y: u8, promotion_piece: Option<PieceType> },
    // Resign from the game
    Resign,
    // Offer a draw
    OfferDraw,
    // Accept a draw
    AcceptDraw,
}

// Program entrypoint
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = ChessInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        ChessInstruction::InitGame { white_player, black_player } => {
            process_init_game(program_id, accounts, white_player, black_player)
        },
        ChessInstruction::MakeMove { from_x, from_y, to_x, to_y, promotion_piece } => {
            process_make_move(program_id, accounts, from_x, from_y, to_x, to_y, promotion_piece)
        },
        ChessInstruction::Resign => {
            process_resign(program_id, accounts)
        },
        ChessInstruction::OfferDraw => {
            process_offer_draw(program_id, accounts)
        },
        ChessInstruction::AcceptDraw => {
            process_accept_draw(program_id, accounts)
        },
    }
}

fn process_init_game(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    white_player: Pubkey,
    black_player: Pubkey,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get the account to store the game state
    let game_account = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    
    // Ensure the game account is owned by the program
    if game_account.owner != program_id {
        // Create the account if it doesn't exist
        let rent = Rent::get()?;
        let space = std::mem::size_of::<GameState>();
        let rent_lamports = rent.minimum_balance(space);
        
        invoke(
            &system_instruction::create_account(
                payer.key,
                game_account.key,
                rent_lamports,
                space as u64,
                program_id,
            ),
            &[payer.clone(), game_account.clone(), system_program.clone()],
        )?;
    }
    
    // Initialize the board with starting positions
    let mut board = [[Piece { piece_type: PieceType::Empty, color: PieceColor::None }; 8]; 8];
    
    // Set up pawns
    for i in 0..8 {
        board[1][i] = Piece { piece_type: PieceType::Pawn, color: PieceColor::White };
        board[i] = Piece { piece_type: PieceType::Pawn, color: PieceColor::Black };
    }
    
    // Set up rooks
    board = Piece { piece_type: PieceType::Rook, color: PieceColor::White };
    board = Piece { piece_type: PieceType::Rook, color: PieceColor::White };
    board = Piece { piece_type: PieceType::Rook, color: PieceColor::Black };
    board = Piece { piece_type: PieceType::Rook, color: PieceColor::Black };
    
    // Set up knights
    board[1] = Piece { piece_type: PieceType::Knight, color: PieceColor::White };
    board = Piece { piece_type: PieceType::Knight, color: PieceColor::White };
    board[1] = Piece { piece_type: PieceType::Knight, color: PieceColor::Black };
    board = Piece { piece_type: PieceType::Knight, color: PieceColor::Black };
    
    // Set up bishops
    board[2] = Piece { piece_type: PieceType::Bishop, color: PieceColor::White };
    board[5] = Piece { piece_type: PieceType::Bishop, color: PieceColor::White };
    board[2] = Piece { piece_type: PieceType::Bishop, color: PieceColor::Black };
    board[5] = Piece { piece_type: PieceType::Bishop, color: PieceColor::Black };
    
    // Set up queens
    board[3] = Piece { piece_type: PieceType::Queen, color: PieceColor::White };
    board[3] = Piece { piece_type: PieceType::Queen, color: PieceColor::Black };
    
    // Set up kings
    board[4] = Piece { piece_type: PieceType::King, color: PieceColor::White };
    board[4] = Piece { piece_type: PieceType::King, color: PieceColor::Black };
    
    // Create the game state
    let game_state = GameState {
        board,
        current_turn: PieceColor::White,
        white_player,
        black_player,
        game_status: GameStatus::Active,
        move_history: Vec::new(),
    };
    
    // Serialize and store the game state
    game_state.serialize(&mut *game_account.data.borrow_mut())?;
    
    msg!("Game initialized successfully");
    Ok(())
}

fn process_make_move(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8,
    promotion_piece: Option<PieceType>,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get the game account
    let game_account = next_account_info(accounts_iter)?;
    let player = next_account_info(accounts_iter)?;
    
    // Ensure the game account is owned by the program
    if game_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize the game state
    let mut game_state = GameState::try_from_slice(&game_account.data.borrow())?;
    
    // Check if the game is active
    if game_state.game_status != GameStatus::Active && 
       game_state.game_status != GameStatus::CheckWhite && 
       game_state.game_status != GameStatus::CheckBlack {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if it's the player's turn
    if (game_state.current_turn == PieceColor::White && *player.key != game_state.white_player) ||
       (game_state.current_turn == PieceColor::Black && *player.key != game_state.black_player) {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Validate move coordinates
    if from_x >= 8 || from_y >= 8 || to_x >= 8 || to_y >= 8 {
        return Err(ProgramError::InvalidArgument);
    }
    
    // Get the piece at the from position
    let piece = game_state.board[from_y as usize][from_x as usize];
    
    // Check if the piece belongs to the current player
    if piece.color != game_state.current_turn {
        return Err(ProgramError::InvalidArgument);
    }
    
    // Get the piece at the to position (if any)
    let captured_piece = if game_state.board[to_y as usize][to_x as usize].piece_type != PieceType::Empty {
        Some(game_state.board[to_y as usize][to_x as usize])
    } else {
        None
    };
    
    // Check if the move is valid (simplified for this example)
    // In a real implementation, you would need to check the rules for each piece type
    
    // Create a move record
    let move_record = Move {
        from_x,
        from_y,
        to_x,
        to_y,
        piece,
        captured_piece,
        is_castling: false, // Simplified for this example
        is_en_passant: false, // Simplified for this example
        promotion_piece,
    };
    
    // Update the board
    game_state.board[to_y as usize][to_x as usize] = piece;
    game_state.board[from_y as usize][from_x as usize] = Piece { piece_type: PieceType::Empty, color: PieceColor::None };
    
    // Handle promotion if applicable
    if let Some(new_piece_type) = promotion_piece {
        if (piece.piece_type == PieceType::Pawn && 
            ((piece.color == PieceColor::White && to_y == 7) || 
             (piece.color == PieceColor::Black && to_y == 0))) {
            game_state.board[to_y as usize][to_x as usize] = Piece { piece_type: new_piece_type, color: piece.color };
        }
    }
    
    // Add the move to history
    game_state.move_history.push(move_record);
    
    // Switch turns
    game_state.current_turn = match game_state.current_turn {
        PieceColor::White => PieceColor::Black,
        PieceColor::Black => PieceColor::White,
        _ => return Err(ProgramError::InvalidAccountData),
    };
    
    // Check for check or checkmate (simplified for this example)
    // In a real implementation, you would need to check for these conditions
    
    // Serialize and store the updated game state
    game_state.serialize(&mut *game_account.data.borrow_mut())?;
    
    msg!("Move executed successfully");
    Ok(())
}

fn process_resign(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get the game account
    let game_account = next_account_info(accounts_iter)?;
    let player = next_account_info(accounts_iter)?;
    
    // Ensure the game account is owned by the program
    if game_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize the game state
    let mut game_state = GameState::try_from_slice(&game_account.data.borrow())?;
    
    // Check if the game is active
    if game_state.game_status != GameStatus::Active && 
       game_state.game_status != GameStatus::CheckWhite && 
       game_state.game_status != GameStatus::CheckBlack {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if the player is part of the game
    if *player.key != game_state.white_player && *player.key != game_state.black_player {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Update the game status based on who resigned
    if *player.key == game_state.white_player {
        game_state.game_status = GameStatus::CheckmateBlack;
    } else {
        game_state.game_status = GameStatus::CheckmateWhite;
    }
    
    // Serialize and store the updated game state
    game_state.serialize(&mut *game_account.data.borrow_mut())?;
    
    msg!("Player resigned");
    Ok(())
}

fn process_offer_draw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Implementation for offering a draw
    // This would set a flag in the game state indicating a draw has been offered
    msg!("Draw offered");
    Ok(())
}

fn process_accept_draw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Get the game account
    let game_account = next_account_info(accounts_iter)?;
    let player = next_account_info(accounts_iter)?;
    
    // Ensure the game account is owned by the program
    if game_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize the game state
    let mut game_state = GameState::try_from_slice(&game_account.data.borrow())?;
    
    // Check if the game is active
    if game_state.game_status != GameStatus::Active && 
       game_state.game_status != GameStatus::CheckWhite && 
       game_state.game_status != GameStatus::CheckBlack {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if the player is part of the game
    if *player.key != game_state.white_player && *player.key != game_state.black_player {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Update the game status to draw
    game_state.game_status = GameStatus::Draw;
    
    // Serialize and store the updated game state
    game_state.serialize(&mut *game_account.data.borrow_mut())?;
    
    msg!("Draw accepted");
    Ok(())
}
  