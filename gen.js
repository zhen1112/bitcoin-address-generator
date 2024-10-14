const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const fs = require('fs');

const bip32 = BIP32Factory(ecc);

const network = bitcoin.networks.bitcoin;


const path = `m/49'/0'/0'/0`;

async function createWallet() {

    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);

    const account = root.derivePath(path);
    const node = account.derive(0).derive(0);


    const btcAddress = bitcoin.payments.p2wpkh({
        pubkey: node.publicKey,
        network: network,
    }).address;

    const walletData = {
        address: btcAddress,
        privateKey: node.toWIF(),
        mnemonic: mnemonic,
    };
    let wallets = [];
    try {
        if (fs.existsSync('wallets.json')) {
            const existingData = fs.readFileSync('wallets.json', 'utf8');
            wallets = JSON.parse(existingData);
            if (!Array.isArray(wallets)) {
                wallets = [];
            }
        }
    } catch (error) {
        console.error('Error reading or parsing wallets.json:', error);
        wallets = [];
    }

    wallets.push(walletData);

    fs.writeFileSync('wallets.json', JSON.stringify(wallets, null, 2));
    console.log(`Wallet ${btcAddress} saved successfully.`);
}

async function createMultipleWallets(num) {
    for (let i = 0; i < num; i++) {
        await createWallet();
    }
}

createMultipleWallets(10000);
