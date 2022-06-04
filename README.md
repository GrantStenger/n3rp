# N3RP • [![tests](https://github.com/gstenger98/N3RP/actions/workflows/tests.yml/badge.svg)](https://github.com/gstenger98/N3RP/actions/workflows/tests.yml)

**N3RP** - An NFT Rental Protocol (pronounced "nerp")

***Smart Contracts Passing Tests, Frontend Functional But Is Being Beautified.*** 🛠


## Introduction
As NFT holders start to gain utility from their NFTs in the form of token-gated events, groups, and products, a critical building block is missing: rentals. The NFT Rental Protocol (n3rp) solves this problem by allowing owners to rent out their NFTs for a specified period of time in exchange for a payment and backed by collateral. The ERC721 NFT standard does not include functionality around temporary NFT ownership. We propose a solution requiring an initial payment, a specified return by time, collateralization, and a collateralization pay out period. 


## Motivation

NFTs are becoming an increasingly important part of people's lives. They are markers of social clout, act as tickets to events, represent membership in clubs, and more. As the utility of NFTs increases, there will be an increasing need for basic financial primitives around NFT ownership. 

In the real world, rentals happen through either a trusted intermediary (e.g. a car dealership) or a trust-based relationship (e.g. a personal or familial bond). Unfortunately, there is currently no good way to trustlessly lend an NFT to someone who wants to take advantage of its utility for a temporary period of time.

For example: Owners of Bored Apes are invited to exclusive events at crypto conferences. Alice, a Bored Ape owner, knows she will be missing the upcoming Crypto Bahamas conference. Bob, another crypto enthusiast who doesn't own a Bored Ape, will be at the Crypto Bahamas conference and would love to go to the Bored Ape meetup. Alice would like to send her Bored Ape to Bob for the day for an agreed-upon rental price and the assurance that Bob will send her the NFT back.

The ERC721 token standard has no native functionality for the type of temporary ownership that Alice and Bob need. With the ERC721 token standard, Alice would have three options to send Bob the NFT: (1) send Bob the NFT and trust Bob to return it, (2) set up a 2-of-3 multisig wallet with Bob and a trusted intermediary, or (3) give Bob the private keys to her wallet.

In the first case, Bob could easily keep the NFT for himself, and Alice would lose a valuable asset. In the second case, Alice and Bob would need to find a trusted intermediary, which is inconvenient, costly, vulnerable to attacks, and against the spirit of decentralized trustlessness. In the third case, Bob could easily use Alice's key to transfer the NFT (and anything else in her wallet!) to himself, with no recourse. Within the ERC721 standard, trustless NFT ownership is impossible.

Rentals are a critical primitive in any asset-based economy, and it is inevitable and essential to the health of the crypto ecosystem that they be introduced. n3rp (the NFT Rental Protocol) proposes the first protocol for trustless NFT rentals. Our hope is that with n3rp, we will have both opened up new and exciting use cases for NFT utility and contributed an important building block in the infrastructure of crypto finance.



## Mechanism

1. The lender has an NFT they're willing to lend, and a borrower has ETH they're willing to pay and put up as collateral in order to borrow the lender's NFT for a specified period of time.

2. The lender and borrower meet in a marketplace and agree on the following terms:

    a) The NFT: a specific NFT which the lender owns and the borrower wants to borrow. 

    b) The rental fee: the fee (in ETH) that the borrower agrees to pay the lender.

    c) The rental due date: the time by which the borrower must return the NFT before additional late fees accumulate.

    d) The collateral: the ETH the borrower locks up until he or she returns the NFT. This collateral acts as an insurance policy for the lender. If the borrower does not return the NFT, the lender will be paid the collateral over the collateral payout period.

    e) The collateral payout period: the amount of time over which the collateral gets paid to the lender if the NFT is not returned to the contract.

3. One of the parties creates the contract with the informally agreed-upon terms; if they are the lender, they send their NFT to the contract. If they are the borrower, they send their rental fee plus collateral to the contract. 

4. Either party can remove their assets from the contract at any point before the other party sends their assets. If the borrower gets cold feet, for example, the borrower can simply claim back their NFT. 

5. How might this contract be concluded? There are three cases.

    a) In the expected case, the borrower returns the NFT to the contract before the rental due date. In this scenario, the NFT is returned to the lender, the collateral is returned to the borrower, and the contract is terminated.

    b) In the case where the NFT is returned during the collateral payout period, the lender is sent both their NFT and the proportion of the collateral they are owed. The borrower is sent the remaining collateral, and the contract is terminated. 
    
    c) In the case where the borrower does not return the NFT before the end of the collateral payout period, the lender can then withdraw the full collateral from the contract. The borrower keeps the NFT (having paid the base payment plus collateral as its cost) and the contract is terminated.


## Evaluation

NFT rentals are an important primitive in DeFi and crypto at large. n3rp is only the first step in a series of innovations that will enable blockchain-based rentals to be used to their full potential. n3rp can be expanded to include features such:

1. Rental extensions: a lender and borrower may agree to extend the rental period without creating a new contract
2. Rental cancellations: a lender may want to unexpectedly end the rental early. In this case, the lender and borrower can decide on an agreed-upon fee in advance to void the rental before its due date.
3. Other forms of collateral: lenders may not have enough liquid ETH to put up as collateral and instead may prefer another asset (i.e. a different token, another NFT, or even collateral that is staked elsewhere)
4. Two-sided rentals (i.e. temporary trades): two parties may have NFTs that they'd like to swap with each other for a temporary period. They can each send their respective NFT (and maybe additional collateral) to a smart contract and swap NFTs for a limited time.
5. Rental transferability: the borrower may decide that they want to lend their rented NFT to a third party.
6. Flash rentals: just as Aave implemented flash loans that don't require collateral for tokens, flash rentals can be implemented for NFTs that are needed only for a very specific use case (and not an extended period of time)

There are many other NFT rental innovations that this paper will not touch on. However, what is clear is that the ERC-721 standard is not adequate for rentals. Over-collateralized rentals -- the only elegant ERC-721 loan solution -- are suboptimal because they lock people who don't have a high amount of liquid ETH out of the rental ecosystem. This becomes particularly problematic for rentals of higher-cost assets because one of the primary reasons people rent high-cost assets is because they don't have enough money to buy them outright.

There is a need for a new ERC standard which defines temporary ownership properties within the state of the token. This would enable any NFT owner to temporarily transfer ownership to another user within the NFT's core functionality. A new, rental-compliant ERC standard would be a major step forward in creating NFTs as a viable asset class.


## Further Discussion

The n3rp NFT Rental Protocol can be framed as a fundamentally different financial primitive: NFT options. In traditional option trading, a trader will pay a small fee to secure the opportunity to buy a security at a fixed price. The option expires at a certain date, at which point the trader can decide whether or not to exercise it. If the price of the security has dropped below the fixed price agreed upon in the option, the trader will not buy the security. If the price of the security is higher than the fixed price agreed upon in the option, the trader will buy the security (and profit).

In n3rp, the rental fee is the option price and the collateral is the fixed price of the security. The borrower pays the rental fee to get the NFT. If, at the end of the rental period, the market price of the NFT is lower than the price of the collateral, the renter will return the NFT as expected. If the market price of the NFT is higher than the price of the collateral, it will be profitable for the renter to keep the NFT. 

In traditional finance, this would be as if the trader buys a security upfront and pays an additional premium for the right to sell the security at either its original price or its new price. However, in our case, the security itself (the NFT) might actually have utility for the trader. The n3rp protocol, by enabling NFT rentals, also enables NFT options trading.


## Conclusion

NFTs are becoming increasingly useful in the world. Today, they are already used for events, membership, clout, and more. In the future, they will be used as representations of physical assets, markers of historical events, digital avatars, and much, much more. In order for this future to come to fruition, an entire class of primitives around the handling of assets needs to be built. We hope that n3rp is the first of many.


## Blueprint

```ml
lib
├─ ds-test — https://github.com/dapphub/ds-test
├─ forge-std — https://github.com/brockelmore/forge-std
├─ solmate — https://github.com/Rari-Capital/solmate
src
├─ tests
│  └─ Rental.t — "N3RP Tests"
└─ Rental — "The NFT Rental Contract"
```


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

## Credits

Frontend Template: https://github.com/jonluca/vite-typescript-ssr-react

Solidity and file structuring guidance:
1. https://github.com/FrankieIsLost/CRISP
2. https://github.com/Anish-Agnihotri/pawnft
3. https://github.com/FrankieIsLost/RICKS
4. https://github.com/m1guelpf/erc721-drop 
5. https://github.com/FrankieIsLost/takeover 
6. https://github.com/mazurylabs/mazury-frontend


## Memes

!["n3rp"](img/nerp.jpg)
