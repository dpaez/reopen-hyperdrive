const {join} = require('path')
const H = require('@geut/hyperdrive-promise')
const Corestore = require('corestore')
const raf = require('random-access-file')
const crypto = require('hypercore-crypto')
const swarm = require('./swarm')
const DatEncoding = require('dat-encoding')

;(async () => {
  // create store
  const baseStore = './dat'
  const store = new Corestore(file => raf(join(baseStore, file)))

  const networking = swarm(store)
  networking.listen()
  networking.on('error', console.error)

  const keyPair = crypto.keyPair()
  const namespace = keyPair.publicKey.toString('hex')
  const drive1 = H(store, keyPair.publicKey, {namespace, keyPair})

  await drive1.ready()

  const data1 = {
    'type': 'profile',
    'title': 'Professor X',
    'status': 'creation',
    'contents': []
  }

  await drive1.writeFile('data.json', JSON.stringify(data1))

  console.log(`seeding content: ${drive1.key.toString('hex')}`)
  networking.seed(drive1.discoveryKey, {announce:true, lookup: true})

  const externalContentUrl = process.argv[2]

  console.log(`Fetching external drive: ${externalContentUrl}`)

  const drive2 = H(store, DatEncoding.decode(externalContentUrl), {namespace: externalContentUrl})
  await drive2.ready()
  console.log('drive2 version', drive2.version)
  networking.seed(drive2.discoveryKey, {announce:true, lookup: true})

  const latest = await drive2.checkout(2)
  await latest.ready()

  console.log('reading data.json from drive2...')
  let data2
  try {
    data2 = await latest.readFile('data.json', 'utf-8')
  } catch (err) {
    console.error(err)
    return
  }
  console.log('data2', data2)
  data1.contents.push(externalContentUrl)

  console.log('Updating profile module...')
  await drive1.writeFile('data.json', JSON.stringify(data1))
  const result = await drive1.readFile('data.json', 'utf-8')
  console.log('data1 updated', result)
  console.log('FIN')
})()
