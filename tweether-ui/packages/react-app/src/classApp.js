import React, { useCallback, useEffect, useState, Component } from "react"
import { Contract } from "@ethersproject/contracts"
import { Web3Provider, getDefaultProvider } from "@ethersproject/providers"
import { useQuery } from "@apollo/react-hooks"

import { Body, Button, Header, Image, Link } from "./components"
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'
import logo from "./ethereumLogo.png"

import { addresses, abis } from "@project/contracts"


async function ReadOnChainData() {
    // Should replace with the end-user wallet, e.g. Metamask
    const defaultProvider = getDefaultProvider('kovan', {
        infura: process.env.INFURA_KOVAN_PROJECT_ID,
    })
    // Create an instance of an ethers.js Contract
    // Read more about ethers.js on https://docs.ethers.io/v6/api/contract/contract/
    const tweether = new Contract(addresses.tweether, abis.tweether, defaultProvider)
    const link = new Contract(addresses.link, abis.linktoken, defaultProvider)
    // A pre-defined address that owns some CEAERC20 tokens
    const nftwe = new Contract(addresses.nftwe, abis.nftwe, defaultProvider)
    const votesRequired = await tweether.votesRequired()
    this.setState({ votesRequired: votesRequired })
    this.setState({ provider: defaultProvider })
}

function WalletButton({ provider, loadWeb3Modal }) {
    return (
        <Button
            onClick={() => {
                if (!provider) {
                    loadWeb3Modal()
                } else {
                    logoutOfWeb3Modal()
                }
            }}
        >
            {!provider ? "Connect Wallet" : "Disconnect Wallet"}
        </Button>
    )
}

function TweetherButton({ provider, loadWeb3Modal }) {
    const defaultProvider = getDefaultProvider('kovan', {
        infura: process.env.INFURA_KOVAN_PROJECT_ID,
    })

    // Create an instance of an ethers.js Contract
    // Read more about ethers.js on https://docs.ethers.io/v6/api/contract/contract/
    const tweether = new Contract(addresses.tweether, abis.tweether, defaultProvider)
    const link = new Contract(addresses.link, abis.linktoken, defaultProvider)
    // A pre-defined address that owns some CEAERC20 tokens
    const nftwe = new Contract(addresses.nftwe, abis.nftwe, defaultProvider)

    return (
        <div>
            TESTEST
        </div>
    )
}

class App extends Component {
    async componentWillMount() {
        await this.ReadOnChainData()
        // await this.loadBlockchainData()
    }
    render() {
        const loadWeb3Modal = useCallback(async () => {
            const newProvider = await web3Modal.connect()
            setProvider(new Web3Provider(newProvider))
        }, [])

        return (
            <div>
                <Header>
                    <WalletButton provider={this.state.provider} loadWeb3Modal={loadWeb3Modal} />
                </Header>
                <Body>
                    <Image src={logo} alt="react-logo" />
                    <TweetherButton />
                    <p>
                        Edit {this.state.votesRequired}<code>packages/react-app/src/App.js</code> and save to reload.
        </p>
                    {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}

                    <Button onClick={() => ReadOnChainData()}>
                        Read On-Chain Data
        </Button>
                </Body>
            </div >
        )
    }
}

// function App() {
//   const [provider, setProvider] = useState()
//   const [votesRequired, setvotesRequired] = useState()
//   /* Open wallet selection modal. */
// const loadWeb3Modal = useCallback(async () => {
//   const newProvider = await web3Modal.connect()
//   setProvider(new Web3Provider(newProvider))
// }, [])

//   /* If user has loaded a wallet before, load it automatically. */
//   useEffect(() => {
//     if (web3Modal.cachedProvider) {
//       loadWeb3Modal()
//     }
//   }, [loadWeb3Modal])

//   // React.useEffect(() => {
//   //   if (!loading && !error && data && data.transfers) {
//   //     console.log({ transfers: data.transfers })
//   //   }
//   // }, [loading, error, data])
//   return (
//     <div>
//       <Header>
//         <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} />
//       </Header>
//       <Body>
//         <Image src={logo} alt="react-logo" />
//         <TweetherButton />
//         <p>
//           Edit {votesRequired}<code>packages/react-app/src/App.js</code> and save to reload.
//         </p>
//         {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}

//         <Button onClick={() => ReadOnChainData()}>
//           Read On-Chain Data
//         </Button>
//       </Body>
//     </div >
//   )
// }

export default App
