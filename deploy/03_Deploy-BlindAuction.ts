import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;
    const { deployer, auctionHost } = await getNamedAccounts() // deployer should be the dao later

    const auctionNFTAddr = (await deployments.get("AuctionNFT")).address
    const auctionNFT = await ethers.getContractAt("AuctionNFT", auctionNFTAddr)
    const args = [auctionNFTAddr, auctionHost, await auctionNFT.name()]

    await deployments.deploy("BlindAuction", {
        from: deployer,
        args: args,
        log: true
    }   
    )
}

export default func;
func.tags = ["auction"]