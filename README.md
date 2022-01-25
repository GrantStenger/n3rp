# NFT Leasing

## Introduction
The NFT Leasing protocol (NLP) allows owners to lease out their NFTs for a specified time period in exchange for payment. Do your NFTs give you access to exclusive events you can't attend? NLP compensates your for your fomo with ETH payments while temporary borrowers get the chance of flexing flashy blue chips. 

## Development 

### Set up 
```
git clone https://github.com/gstenger98/nft-leasing
git submodule update --init --recursive ## install dependencies
forge build
```

### Test 

```
forge test
```

### Lint 
```
npm install 
npm run lint 
```

## Initial Specs
1. A lender and borrower must both consent into the following contract
2. The borrower wants to be able to lease a specific NFT for a predefined period of time
3. Require that the lender owns the NFT
4. In exchange for leasing out their NFT, the lender receives an initial lump sum payment
5. The lender additionally requires collateral to be put up to prevent the borrower from rugging
6. Require that the borrower has the initial sum and the collateral before proceeding
7. If the borrower steals, sells, or loses the NFT or is otherwise unable to return it, the collateral is paid to the lender daily in high interest payments until the NFT is return or the collateral is depleted 
8. If the borrower returns the NFT before their agreed upon expiration, their collateral is returned and the contract is terminated