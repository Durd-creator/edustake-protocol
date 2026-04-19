import { HardhatUserConfig } from "hardhat/config";
// Agora estamos importando o Ethers puro e direto!
import "@nomicfoundation/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
};

export default config;