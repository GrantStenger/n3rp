# N3RP • [![tests](https://github.com/gstenger98/N3RP/actions/workflows/tests.yml/badge.svg)](https://github.com/gstenger98/N3RP/actions/workflows/tests.yml)

**N3RP** - An NFT Rental Protocol

***Not Production Ready Yet***


## Introduction
The NFT Rental Protocol (N3RP) allows owners to rent out their NFTs for a specified time period in exchange for payment. Do your NFTs give you access to exclusive events you can't attend? N3RP compensates your for your fomo with ETH payments while temporary borrowers get the chance of flexing flashy blue chips. 

My intention is to implement the functionality for [standard leases](https://en.wikipedia.org/wiki/Lease) applied in the context of digital assets (specifically [ERC721 tokens](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)).


## Motivation

Token-gated event access is becoming an increasingly attractive and reliable pathway for the everyday crypto-user to attend events like concerts, parties, and conferences. The trouble is, while token-gated event access guarantees the owner access to a given event, it only guarantees the owner access. This is suboptimal in the following sense: in the case that the owner is unable to attend the event, he cannot easily lend it to a potential attendee for a suitable period of time (say, for the duration of the event). To bring this dynamic to light, consider the following hypothetical situation.

Alice has lifetime season tickets to the games of her favorite sports team, represented as NFT #2a (her seat) from the Warriors collection created by NBA Labs. Bob would love to borrow Alice’s ticket to see the game, but doesn’t want to pay for season tickets. In this case, Alice would require a payment and the assurance that Bob will return the tickets to her. 

How can these strangers coordinate this transaction safely? Alice can either transfer ownership to Bob or she can keep it for herself. In the first case, Alice has no guarantee that Bob will transfer ownership back to her after the game. In the second case, Bob can’t enter the stadium. Even if Alice shares her private keys with Bob, Hacker Hank might be listening and steal her ticket or Bob himself might maliciously steal her assets. In either case, it seems that temporary ownership strategies fall short. Within the constraints of the ERC 721 standard, assigning temporary ownership is impossible. 


## Mechanism

1. The lender has an NFT they're willing to lend, and a borrower has ETH they're willing to pay and put up as collateral in order to borrow the NFT for a specified period of time. 

2. The lender and borrower meet in a marketplace and agree upon the following terms:

    a) The NFT: the NFT which must be owned by the lender that the borrower wants to rent

    b) The base payment: the base payment in ETH that the borrower agrees to pay the lender, which is all that is paid if the borrower returns the NFT before the rental period ends

    c) The rental due date: the time the borrower must return the NFT by before additional late fees accumulate

    d) The collateral: the ETH the borrower puts up which gets paid out linearly to the lender during the collateral payout period beginning at the end of the rental period

    e) The collateral payout period: the amount of time over which the collateral gets paid from the borrower to the lender if the NFT is not yet returned to the contract

    f) The nullification period: the period by which if both parties haven't deposited their required assets the contract is nullified.

3. One of the parties creates the contract with the informally agreed upon terms; if they are the lender, they send their NFT to the contract, and if they are the borrower, they send their base payment plus collateral to the contract. This contract will also include a nullification time by which the contract becomes nullified if the other party does not send their designated assets by this time. 

4. With this contract created and one party having sent their designated assets, there are two cases to consider: the second party either a) fails to send their assets before the nullification period, or b) successfully sends their assets before the nullification period.

    a) In the first case, the first party has the ability to withdraw their assets at any point if the second party has not deposited their full amount. If the nullification date comes and the second party has not deposited their required assets, the first party's assets are returned to them.
    
    b) In the second case where both parties deposit their assets before the nullification date, the rental period begins. At the moment the final asset enters the contract, the NFT is sent to the borrower and the rental payment is sent to the lender. 

5. How might this contract be concluded? There are three cases.

    a) In the typical case, the borrower returns the NFT to the contract before the rental due date. In this scenario, the NFT is returned to the lender, the collateral is returned to the borrower, and the contract is terminated. 

    b) In the case where the NFT is returned during the collateral payout period, the lender is sent both their NFT and also the proportion of the collateral they are owed, the borrower is sent the collateral remaining, and the contract is terminated. 
    
    c) In the case where the borrower never returns the NFT, when the collateral payout period ends, the lender can then withdraw the full collateral from the contract, the borrower keeps the NFT having paid a premium of the base payment plus collateral, and the contract is terminated. 


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


## Questions
1. Is collateral required? If the NFT needs to be transfered to the borrower's EOA then collateral is likely required. 
2. Do we need to inherit from ERC721? PawnBank does not, Takeover does, CRISP does but is also abstract, RICKS inherits from ERC20 and ERC721Holder...
3. Are all my functions/variables properly scoped?
4. Do I use memory/storage in the correct places?
5. Which functions need to be payable?
    payable if you want to get money from the sender
    on the function that the borrower calls to put up their collateral (call a payable function with a certain amt)
    how would the contract send money back?
        not payable (only when function receives money)
        payable(address sending to).call({value: amt})
6. Am I using immutable correctly?
7. Do I use SafeMath/PRBMathSD59x18 in the correct places?
8. What license should I use for this? GPL-3.0? MIT? Unliscence?
9. Are there other error conditions I should consider? How do I integrate these errors correctly?
10. Who calls this contract? How do we make sure both parties consent to this agreement?
11. What are clearest variable names?
    a. originalOwner vs lenderAddress?
    b. temporaryOwner vs borrowerAddress?
    c. expiry vs expirationTime?
    d. costToLease vs initialPayment?
12. How can this be exploited?
13. Should the LeaseNFT contract be abstract or should I implement each of the ERC721 functions?
14. How could we accept other forms of collateral other than ETH?
15. Users shouldn't have to redeploy this contract everytime they want to create a lease. Create a Lease struct
    containing the relevant information for each lender-borrower-nft object and make a map of all live leases.
    The drawback of this is that everyone relies on the same contract, so if anything breaks risk/security is 
    spread across all users. The benefits is that it'll be cheaper for uses because they won't have to redeploy.
16. Which functions should be view/pure?
17. Do any get (view) functions need to be added?
18. None of our functions have any returns. Should they have any?
19. Am I handling ETH-Wei conversions correctly? Could a contract be created with a decimal ETH payment or collateral?
20. Do I need to do anything specific to terminate the contract?
21. Confirm that the calculations for how much the lender can withdraw during and after the payout period is correct.
22. What are standard solidity conventions about enters between functions, ifs, requires, etc?
23. Make sure this code accords to standard solidity style guidelines.


## To Do's:
1. Write tests
2. Answer all of the above questions
3. Deploy to EVM
4. Add renew lease functionality
5. Encode payment methods other than lump sum (periodic payments being an obvious alternative)
6. Add auction structure where potential borrowers place bids for NFTs they'd like to borrow over specified time periods
7. Deploy to Avalanche or Arbitrum


## Memes

!["n3rp"](img/nerp.jpg)