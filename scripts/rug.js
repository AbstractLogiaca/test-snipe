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

    // Uniswap Router and Token addresses
    const UNISWAP_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24"; // Replace with the correct Uniswap Router address for chain       <--------------------- CHANGE ME
    const TOKEN_ADDRESS = "0xCaFe1407811ef2cCa403b2b99a6e0FE96C50A17f"; // Replace with the deployed token address     <-------------------------------------------------- CHANGE ME
    const LP_TOKEN_ADDRESS = "0x450D52576670da178b911D921197a24c2607e934"; // Replace with the LP token address for the token-ETH pair      <----------------------------- CHANGE ME
    
    console.log("Removing liquidity with the account:", wallet.address);

    const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);

    const lpTokenContract = new ethers.Contract(LP_TOKEN_ADDRESS, ERC20_ABI, wallet);
    const liquidity = await lpTokenContract.balanceOf(wallet.address);
    console.log(`LP token balance: ${ethers.formatUnits(liquidity, 18)} LP tokens`);

    if (liquidity == 0) {
        console.log("No liquidity to remove.");
        return;
    }

    const amountTokenMin = ethers.parseUnits("0", 18);
    const amountETHMin = ethers.parseEther("0");

    const approveTx = await lpTokenContract.approve(UNISWAP_ROUTER_ADDRESS, liquidity);
    await approveTx.wait();
    console.log("Approval transaction confirmed.");

    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    console.log("Removing liquidity...");
    const removeLiquidityTx = await router.removeLiquidityETH(
        TOKEN_ADDRESS,        // Address of the token
        liquidity,            // Amount of LP tokens to remove
        amountTokenMin,       // Minimum token amount to receive
        amountETHMin,         // Minimum ETH amount to receive
        wallet.address,       // Address to receive the tokens and ETH
        deadline              // Deadline timestamp
    );
    
    const receipt = await removeLiquidityTx.wait();
    console.log("Liquidity removed successfully! Transaction hash:", receipt.transactionHash);
}

main().catch((error) => {
    console.error("Error removing liquidity:", error);
    process.exitCode = 1;
});