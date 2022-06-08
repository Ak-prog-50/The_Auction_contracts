import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;

    const auctionNFTAddr = (await deployments.get("AuctionNFT")).address
    const auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr)
    const args = [auctionNFTAddr, await auctionNFT.name()]

    await deployments.deploy("BlindAuction", {
        from: (await getNamedAccounts()).deployer,
        args: args,
        log: true
    }   
    )
}

export default func;
func.tags = ["auction"]