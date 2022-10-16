export const MIN_DELAY = 100; //100 seconds
import { BigNumber, ethers } from "ethers"

export const developmentChains: string[] = ["hardhat", "localhost"]

export const constants = {
  VERIFICATION_BLOCK_CONFIRMATIONS : 4,
  ONE_AUCTION_TOKEN : ethers.BigNumber.from(10).pow(18),
  MAX_TOKENS : 100,
  TRUSTED_FORWARDER : "0xFD4973FeB2031D4409fB57afEE5dF2051b171104",
  MAX_REDEEM_PERIOD: ( 3600 * 24 ), // 24 hours
  NFT_ADDR : "", // || undefined
  TOKEN_ADDR : "" // || undefined
}