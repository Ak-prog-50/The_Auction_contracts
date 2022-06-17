import { network } from "hardhat";

const moveTime = async () => {
  await network.provider.send("evm_increaseTime", [3600 * 24 + 1]);
};

moveTime()
  .then(() => console.log("Time moved forward"))
  .catch((err) => console.error(err));
