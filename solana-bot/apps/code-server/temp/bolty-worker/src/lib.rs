use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Define the data structure to store missile counts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MissileCounts {
    pub india: u32,
    pub pakistan: u32,
}

// Define instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MissileInstruction {
    // Initialize a new missile counter account
    Initialize,
    // Increment missile count for a country (0 = India, 1 = Pakistan)
    IncrementCount { country: u8 },
    // Get current missile counts
    GetCounts,
}

// Program entrypoint
entrypoint!(process_instruction);

// Program logic
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize the instruction
    let instruction = MissileInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        MissileInstruction::Initialize => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts)
        }
        MissileInstruction::IncrementCount { country } => {
            msg!("Instruction: IncrementCount");
            process_increment_count(program_id, accounts, country)
        }
        MissileInstruction::GetCounts => {
            msg!("Instruction: GetCounts");
            process_get_counts(program_id, accounts)
        }
    }
}

// Initialize a new missile counter account
fn process_initialize(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let missile_counter_account = next_account_info(account_info_iter)?;

    // Check if the account is owned by our program
    if missile_counter_account.owner != program_id {
        msg!("Missile counter account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Initialize the account with zero counts
    let missile_counts = MissileCounts {
        india: 0,
        pakistan: 0,
    };

    // Serialize and store the missile counts
    missile_counts.serialize(&mut *missile_counter_account.data.borrow_mut())?;
    msg!("Missile counter initialized: India: 0, Pakistan: 0");

    Ok(())
}

// Increment missile count for a country
fn process_increment_count(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    country: u8,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let missile_counter_account = next_account_info(account_info_iter)?;

    // Check if the account is owned by our program
    if missile_counter_account.owner != program_id {
        msg!("Missile counter account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the account data
    let mut missile_counts = MissileCounts::try_from_slice(&missile_counter_account.data.borrow())
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // Update the count based on the country
    match country {
        0 => {
            missile_counts.india += 1;
            msg!("Incremented India's missile count to: {}", missile_counts.india);
        }
        1 => {
            missile_counts.pakistan += 1;
            msg!("Incremented Pakistan's missile count to: {}", missile_counts.pakistan);
        }
        _ => {
            msg!("Invalid country code. Use 0 for India, 1 for Pakistan");
            return Err(ProgramError::InvalidArgument);
        }
    }

    // Serialize and store the updated missile counts
    missile_counts.serialize(&mut *missile_counter_account.data.borrow_mut())?;

    Ok(())
}

// Get current missile counts
fn process_get_counts(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let missile_counter_account = next_account_info(account_info_iter)?;

    // Check if the account is owned by our program
    if missile_counter_account.owner != program_id {
        msg!("Missile counter account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the account data
    let missile_counts = MissileCounts::try_from_slice(&missile_counter_account.data.borrow())
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // Log the current counts
    msg!(
        "Current missile counts - India: {}, Pakistan: {}",
        missile_counts.india,
        missile_counts.pakistan
    );

    Ok(())
}
