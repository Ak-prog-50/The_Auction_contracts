export const MIN_DELAY = 100; //100 seconds
import { BigNumber, ethers } from "ethers"

export const developmentChains: string[] = ["hardhat", "localhost"]

export const constants = {
  VERIFICATION_BLOCK_CONFIRMATIONS : 6,
  ONE_AUCTION_TOKEN : ethers.BigNumber.from(10).pow(18),
  MAX_TOKENS : 100,
  TRUSTED_FORWARDER : "0xFD4973FeB2031D4409fB57afEE5dF2051b171104",
  MAX_REDEEM_PERIOD: ( 3600 * 24 ), // 24 hours
  NFT_ADDR : "0x7272924794377Dd0EF0E92c0F675beb488b32443", // || undefined
  TOKEN_ADDR : "0x35f27f917C3F73DBD1015A39d0C63FecDBf43d6D" // || undefined
}