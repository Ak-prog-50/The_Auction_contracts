import endAuction from "./endAuction";
import redeem from "./redeem";

const main = async () => {
  await endAuction();
  await redeem();
};

main()
  .then(() => console.log("endSetup complete!"))
  .catch((err) => {
    console.error(err);
  });
