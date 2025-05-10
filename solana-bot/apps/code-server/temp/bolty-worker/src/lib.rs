use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    program_error::ProgramError,
};

// Define the instruction data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum HelloWorldInstruction {
    SayHello,
}

// Declare the program entrypoint
entrypoint!(process_instruction);

/act to / Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize the instruction data
    let instruction = HelloWorldInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
    // Process the instruction
    match instruction {
        HelloWorldInstruction::SayHello => {
            msg!("Hello, World!");
            Ok(())
        }
    }
}
  