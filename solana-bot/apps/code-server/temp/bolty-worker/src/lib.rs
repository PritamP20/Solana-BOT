use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
  account_info::{next_account_info, AccountInfo},
  entrypoint,
  entrypoint::ProgramResult,
  msg,
  program_error::ProgramError,
  pubkey::Pubkey,
  system_instruction,
  program::{invoke, invoke_signed},
  sysvar::{rent::Rent, Sysvar},
};

#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum EscrowInstruction {
  Init { amount: u64 },
  Claim,
  Cancel,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Default, PartialEq)]
pub struct EscrowState {
  pub is_initialized: bool,
  pub depositor: Pubkey,
  pub beneficiary: Pubkey,
  pub amount: u64,
}

entrypoint!(process_instruction);

pub fn process_instruction(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  instruction_data: &[u8],
) -> ProgramResult {
  let instruction = EscrowInstruction::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;

  match instruction {
    EscrowInstruction::Init { amount } => {
      let accounts_iter = &mut accounts.iter();
      let depositor = next_account_info(accounts_iter)?;
      let beneficiary = next_account_info(accounts_iter)?;
      let escrow_account = next_account_info(accounts_iter)?;
      let system_program = next_account_info(accounts_iter)?;

      if !depositor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
      }

      // Create escrow state
      let mut escrow_data = EscrowState::try_from_slice(&escrow_account.data.borrow())
        .unwrap_or_default();

      if escrow_data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
      }

      escrow_data.is_initialized = true;
      escrow_data.depositor = *depositor.key;
      escrow_data.beneficiary = *beneficiary.key;
      escrow_data.amount = amount;
      escrow_data.serialize(&mut &mut escrow_account.data.borrow_mut()[..])?;

      // Transfer lamports from depositor to escrow account
      invoke(
        &system_instruction::transfer(depositor.key, escrow_account.key, amount),
        &[depositor.clone(), escrow_account.clone(), system_program.clone()],
      )?;

      Ok(())
    }
    EscrowInstruction::Claim => {
      let accounts_iter = &mut accounts.iter();
      let beneficiary = next_account_info(accounts_iter)?;
      let escrow_account = next_account_info(accounts_iter)?;
      let system_program = next_account_info(accounts_iter)?;

      let mut escrow_data = EscrowState::try_from_slice(&escrow_account.data.borrow())?;

      if !escrow_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
      }
      if escrow_data.beneficiary != *beneficiary.key {
        return Err(ProgramError::InvalidAccountData);
      }
      if !beneficiary.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
      }

      let amount = escrow_data.amount;
      **escrow_account.try_borrow_mut_lamports()? -= amount;
      **beneficiary.try_borrow_mut_lamports()? += amount;

      // Mark escrow as closed
      escrow_data.is_initialized = false;
      escrow_data.amount = 0;
      escrow_data.serialize(&mut &mut escrow_account.data.borrow_mut()[..])?;

      Ok(())
    }
    EscrowInstruction::Cancel => {
      let accounts_iter = &mut accounts.iter();
      let depositor = next_account_info(accounts_iter)?;
      let escrow_account = next_account_info(accounts_iter)?;
      let system_program = next_account_info(accounts_iter)?;

      let mut escrow_data = EscrowState::try_from_slice(&escrow_account.data.borrow())?;

      if !escrow_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
      }
      if escrow_data.depositor != *depositor.key {
        return Err(ProgramError::InvalidAccountData);
      }
      if !depositor.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
      }

      let amount = escrow_data.amount;
      **escrow_account.try_borrow_mut_lamports()? -= amount;
      **depositor.try_borrow_mut_lamports()? += amount;

      // Mark escrow as closed
      escrow_data.is_initialized = false;
      escrow_data.amount = 0;
      escrow_data.serialize(&mut &mut escrow_account.data.borrow_mut()[..])?;

      Ok(())
    }
  }
}
  