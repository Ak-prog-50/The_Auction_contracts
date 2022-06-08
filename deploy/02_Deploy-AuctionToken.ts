import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;

    const args = ["villacoin", "vic", 100]
    await deployments.deploy("AuctionToken", {
        from: (await getNamedAccounts()).deployer,
        args: args,
        log: true
    }   
    )
}

export default func;
func.tags = ["auctionToken"]