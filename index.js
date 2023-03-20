const { ethers, NonceManager } = require("ethers");
const env = require("./env.json");
var Promise = require("bluebird");
const abi = require("./abi.json");

const arbiProvider = new ethers.JsonRpcProvider("https://endpoints.omniatech.io/v1/arbitrum/one/public");
const ethProvider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

const tokenDistributorAddress = "0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9"
const ARBAdress = "0x912CE59144191C1204E64559FE8253a0e49E6548"

const tokenDistributorContract = new ethers.Contract(tokenDistributorAddress, abi.Distributor, arbiProvider);
const ARB = new ethers.Contract(ARBAdress, abi.ARB, arbiProvider);

async function main() {
    const blockStart = await tokenDistributorContract.claimPeriodStart();
    let currentBlock = await ethProvider.getBlockNumber();

    //wait for blockStart to be mined
    while(currentBlock.toString() < blockStart.toString()) {
        await new Promise(r => setTimeout(r, 100));
        console.log("Waiting for block " + blockStart.toString() + " to be mined. Current block: " + currentBlock.toString());
        currentBlock = await ethProvider.getBlockNumber();
    }

    await Promise.map(
        env.arrayPK,
        async (pk) => {
            try {
                //init wallet
                const wallet = new ethers.Wallet(pk, arbiProvider);
                //get nonce
                const nonceman = new NonceManager(wallet);
                let nonce = await nonceman.connect(arbiProvider).getNonce();

                //claim ARB          
                const tx1 = await tokenDistributorContract.connect(wallet).claim({nonce: nonce});

                //get the amount of token to transfer
                const tokenToClaim = await tokenDistributorContract.claimableTokens(wallet.address);
                console.log("Claiming " + tokenToClaim.toString()*Math.pow(10,-18) + " ARB for " + wallet.address);

                //transfer ARB to CEX
                const tx2 = await ARB.connect(wallet).transfer(env.cex, 0, {nonce : nonce+1});
                console.log("Claimed " + tokenToClaim.toString()*Math.pow(10, -18) + " ARB for " + wallet.address + " and transfered to " + env.cex);
            } catch (error) {
                throw error;
            }
        },
        { concurrency: 3 } //change this number to the number of PK you put in the env.json file
    )

    

}

main()