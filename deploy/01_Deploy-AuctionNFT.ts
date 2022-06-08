import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;

    const args = ["The Villa House", "VH", "https://"]
    await deployments.deploy("AuctionNFT", {
        from: (await getNamedAccounts()).deployer,
        args: args,
        log: true
    }   
    )
}

export default func;
func.tags = ["auctionNFT"]