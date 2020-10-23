import React, { useCallback, useEffect, useState, Component } from "react"
import { Contract } from "@ethersproject/contracts"
import { Web3Provider, getDefaultProvider } from "@ethersproject/providers"
import { useQuery } from "@apollo/react-hooks"
import Web3 from "web3"

import { Body, Button, Header, Image, Link } from "./components"
import { web3Modal, logoutOfWeb3Modal } from './utils/web3Modal'
import logo from "./img/tweeter.png"

import { addresses, abis } from "@project/contracts"



class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    // Load DAI as the starting default Token Data
    // const daiTokenData = DaiToken.networks[networkId];
    const tweether = new web3.eth.Contract(abis.tweether, addresses.tweether)
    const link = new web3.eth.Contract(abis.link, addresses.link)
    // let erc20Balance = await erc20.methods.balanceOf(this.state.account).call()
    let votesRequired = await tweether.methods.votesRequired().call()
    votesRequired = window.web3.utils.fromWei(votesRequired, "ether")
    this.setState({ tweether: tweether })
    this.setState({ link: link })
    this.setState({ votesRequired: votesRequired })
    this.setState({ proposalId: 0 })
    await this.setTweetProposal(this.state.proposalId)
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      )
    }
  }

  mint = (amount) => {
    this.setState({ loading: true })
    this.state.link.methods.approve(addresses.tweether, amount).send({ from: this.state.account }).on("transactionHash", (hash) => {
      this.state.tweether.methods
        .mint(amount)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false })
        })
    })
  };

  proposeTweet = (daysValid, tweetContent) => {
    tweetContent = "\"" + tweetContent + "\""
    this.setState({ loading: true })
    this.state.tweether.methods.approve(addresses.tweether, 10).send({ from: this.state.account }).on("transactionHash", (hash) => {
      this.state.tweether.methods
        .proposeTweet(daysValid, tweetContent)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false })
        })
    })
  };

  vote = (proposalId, numberOfVotes) => {
    numberOfVotes = window.web3.utils.toWei(numberOfVotes, "ether")
    this.setState({ loading: true })
    this.state.tweether.methods.approve(addresses.tweether, 1000).send({ from: this.state.account }).on("transactionHash", (hash) => {
      this.state.tweether.methods
        .vote(proposalId, numberOfVotes)
        .send({ from: this.state.account })
        .on("transactionHash", (hash) => {
          this.setState({ loading: false })
        })
    })
  };

  async setTweetProposal(id) {
    this.setState({ loading: true })
    let proposal = await this.state.tweether.methods.getTweetProposal(id).call()
    this.setState({ proposal: proposal[2] })
    this.setState({ proposalId: id })
    this.setState({ loading: false })
    this.setState({ proposalVotes: window.web3.utils.fromWei(proposal[3], "ether") })
  };

  // async getProposalInfo() {
  //   this.setState({ loading: true })
  //   let proposal = await this.state.tweether.methods.getTweetProposal(this.state.proposalId).call()

  //   this.setState({ loading: false })
  // };

  constructor(props) {
    super(props)
    this.state = {
      account: "0x0",
      tweether: {},
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading...
        </p>
      )
    }

    return (
      <div style={{ backgroundColor: "powderblue" }}>
        <h1>
          Tweether
        </h1>
        { content}
        <Body class="bg-image" >
          <Image src={logo} alt="tweether-logo" />
          <p>Current Tweet Selected: <br />{this.state.proposal}</p>
          <p>Current Votes: <br />{this.state.proposalVotes}</p>
          <p>
            Votes Required To Pass A Tweet {this.state.votesRequired}
          </p>

          <form
            className="mb-3"
            onSubmit={(event) => {
              event.preventDefault()
              let amount
              amount = this.input.value.toString()
              amount = window.web3.utils.toWei(amount, "Ether")
              this.mint(amount)
            }}
          >
            <div className="input-group mb-4">
              <input
                type="text"
                ref={(input) => {
                  this.input = input
                }}
                className="form-control form-control-lg"
                placeholder="0"
                required
              />
            </div>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={(event) => {
              event.preventDefault()
              let amount
              amount = this.input.value.toString()
              amount = window.web3.utils.toWei(amount, "Ether")
              this.mint(amount)
            }}
          >
            Mint $TWE
            </button>




          <form
            className="mb-3"
            onSubmit={(event) => {
              event.preventDefault()
              let proposalId, numberOfVotes
              proposalId = this.state.proposalId
              numberOfVotes = this.input.value.toString()
              this.vote(proposalId, numberOfVotes)
            }}
          >
            <div className="input-group mb-4">
              <input
                type="text"
                ref={(input) => {
                  this.input = input
                }}
                className="form-control form-control-lg"
                placeholder="9"
                required
              />
            </div>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={(event) => {
              event.preventDefault()
              let proposalId, numberOfVotes
              proposalId = this.state.proposalId
              numberOfVotes = this.input.value.toString()
              this.vote(proposalId, numberOfVotes)
            }}
          >
            Number of Votes for a tweet
            </button>






          <form
            className="mb-3"
            onSubmit={(event) => {
              event.preventDefault()
              let daysValid, tweetContent
              daysValid = 7
              tweetContent = this.input.value
              this.proposeTweet(daysValid, tweetContent)
            }}
          >
            <div className="input-group mb-4">
              <input
                type="text"
                ref={(input) => {
                  this.input = input
                }}
                className="form-control form-control-lg"
                placeholder="@AlexRoan and @PatrickAlphaC are awesome..."
                required
              />
            </div>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={(event) => {
              event.preventDefault()
              let daysValid, tweetContent
              daysValid = 7
              tweetContent = this.input.value.toString()
              this.proposeTweet(daysValid, tweetContent)
            }}
          >
            Propose Tweet
            </button>





          <form
            className="mb-3"
            onSubmit={(event) => {
              event.preventDefault()
              let id
              id = this.input.value.toString()
              this.setTweetProposal(id)
            }}>
            <div className="input-group mb-4">
              <input
                type="text"
                ref={(input) => {
                  this.input = input
                }}
                className="form-control form-control-lg"
                placeholder="0"
                required
              />
            </div>
          </form>
          <button
            type="submit"
            className="btn btn-link btn-block btn-sm"
            onClick={(event) => {
              event.preventDefault()
              let id
              id = this.input.value.toString()
              this.setTweetProposal(id)
            }}
          >
            Set Proposal By Id
            </button>
        </Body>

      </div >
    )
  }
}



export default App
