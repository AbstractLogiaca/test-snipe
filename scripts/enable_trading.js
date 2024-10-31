require('dotenv').config();
const { ethers } = require("ethers");
const { abi: UNISWAP_ROUTER_ABI } = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');

const tokenABI = require("../artifacts/contracts/snp-test.sol/TOKEN.json").abi;
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const TOKEN_ADDRESS = "0xCaFe1407811ef2cCa403b2b99a6e0FE96C50A17f"; // Replace with the deployed token address     <-------------------------------------------------- CHANGE ME
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, tokenABI, wallet);

    //  disableMinting txn to be used as a check for the sniper's event listener
    // {
    //     console.log("Disabling mint...");
    //     const tx = await tokenContract.disableMinting();
    //     await tx.wait();
    //     console.log("Mint disabled successfully. Transaction hash:", tx.hash);
    // }

    {
        console.log("Enabling trading...");
        const tx = await tokenContract.someFunction();
        await tx.wait();
        console.log("Trading enabled successfully. Transaction hash:", tx.hash);
    }

}

main().catch((error) => {
    console.error("Error removing liquidity:", error);
    process.exitCode = 1;
});