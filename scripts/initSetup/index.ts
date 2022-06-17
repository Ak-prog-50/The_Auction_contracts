import { startRegistering } from "./startRegistering";
import { increaseAllowance } from "./increaseAllowance";
import { approveNFTTransfer } from "./approveNFTTransfer";

const main = async () => {
    startRegistering().catch((err) => console.error(err));
    increaseAllowance().catch((err) => console.error(err));
    approveNFTTransfer().catch((err) => console.error(err));
}

main().then(() => console.log("Setup1 complete!")).catch((err) => {
    console.error(err);
    process.exit(1);
});