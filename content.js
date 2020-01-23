const { join } = require('path')
const H = require('@geut/hyperdrive-promise')
const Corestore = require('corestore')
const swarm = require('./swarm')
const ram = require('random-access-memory')
const crypto = require('hypercore-crypto')

;(async () =>{

  const store = new Corestore(ram)
  const networking = swarm(store)
  networking.listen()

  const keyPair = crypto.keyPair()

  const namespace = keyPair.publicKey.toString('hex')
  const drive = H(store, keyPair.publicKey, {namespace, keyPair})
  await drive.ready()

  const contentModule = {
    type: 'content',
    title: 'THE CONTENT',
    description: 'some content module',
  }

  await drive.writeFile('data.json', JSON.stringify(contentModule))

  networking.seed(drive.discoveryKey, {announce: true, lookup: true})

  console.log(`Seeding content: ${drive.key.toString('hex')}`)
  console.log(`Seeding discoveryKey: ${drive.discoveryKey.toString('hex')}`)
  console.log(`Content version: ${drive.version}`)
  console.log()
})()

