require('dotenv').config();
const { ethers } = require("ethers");
const { abi: UNISWAP_ROUTER_ABI } = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');

const tokenABI = require("../artifacts/contracts/snp-test.sol/TOKEN.json").abi;
const tokenBytecode = require("../artifacts/contracts/snp-test.sol/TOKEN.json").bytecode;

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("Deploying contract with the account:", wallet.address);

    const TokenFactory = new ethers.ContractFactory(tokenABI, tokenBytecode, wallet);

    const token = await TokenFactory.deploy(
        "SnipeMe",                  // Token name
        "LFG",                      // Token symbol
        1000000,                    // maxSupply
        18                          // decimals
    );
    
    await token.waitForDeployment();
    console.log("Token deployed to:", token.target);

    const walletTokenBalance = await token.balanceOf(wallet.address);
    console.log("Wallet token balance:", ethers.formatUnits(walletTokenBalance, 18));

    const UNISWAP_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";
    const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);

    const amountTokenDesired = walletTokenBalance;               // Use entire token balance
    const amountETHDesired = ethers.parseEther("0.2");           // 0.2 ETH for liquidity          <------------------------------------- CHANGE ME
    const amountTokenMin = ethers.parseUnits("0", 18);           // Slippage tolerance: 0% for tokens
    const amountETHMin = ethers.parseEther("0");                 // Slippage tolerance: 0% for ETH
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;    // 10 minutes from now

    console.log("Approving Uniswap to spend tokens...");
    const approveTx = await token.approve(UNISWAP_ROUTER_ADDRESS, amountTokenDesired);
    await approveTx.wait();
    console.log("Approval transaction confirmed.");

    console.log("Adding liquidity...");
    const addLiquidityTx = await router.addLiquidityETH(
        token.target,               // Use token's address (target)
        amountTokenDesired,         // Token amount to be added
        amountTokenMin,             // Minimum amount of tokens to add
        amountETHMin,               // Minimum amount of ETH to add
        wallet.address,             // LP tokens will be sent to this address
        deadline,                   // Deadline
        { value: amountETHDesired } // Send ETH along with the transaction
    );
    
    const receipt = await addLiquidityTx.wait();
    console.log("Liquidity added successfully! Transaction hash:", receipt.transactionHash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});