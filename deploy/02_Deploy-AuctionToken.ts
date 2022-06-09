import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;
    const { deployer, auctionHost } = await getNamedAccounts()

    const args = ["villacoin", "vic", 100, auctionHost]
    await deployments.deploy("AuctionToken", {
        from: deployer,
        args: args,
        log: true
    }   
    )
}

export default func;
func.tags = ["auctionToken"]