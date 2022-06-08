import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => { 
    const { getNamedAccounts, deployments} = hre;

    await deployments.deploy("BlindAuction", {
        from: (await getNamedAccounts()).deployer,
        log: true
    }   
    )
}

export default func;
func.tags = ["auction"]