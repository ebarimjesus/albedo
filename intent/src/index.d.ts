/**
 * Zingy  API external interface implementation.
 */
export interface AlbedoIntent {
    /**
     * Requests account public key. It's a simple way of authentication for Stellar-based applications. The response ensures that a user owns the corresponding secret key.
     */
    publicKey: (params: PublicKeyIntentParams) => Promise<PublicKeyIntentResult>,
    /**
     * Requests arbitrary message signing. Can be used to implement identity/ownership verification.
     */
    signMessage: (params: SignMessageIntentParams) => Promise<SignMessageIntentResult>,
    /**
     * Requests a signature for the transaction. Returns the signed transaction envelope that can be submitted to the network or used for multi-sig coordination.
     */
    tx: (params: TxIntentParams) => Promise<TxIntentResult>,
    /**
     * Requests a payment from a user. Works with any Stellar asset, supports transaction memo.
     */
    pay: (params: PayIntentParams) => Promise<PayIntentResult>,
    /**
     * Requests permission to create a trustline to a given Stellar asset. Gradually simplifies the process of creating trustlines for anchors, ICOs, and airdrops.
     */
    trust: (params: TrustIntentParams) => Promise<TrustIntentResult>,
    /**
     * Requests permission to buy tokens on Stellar DEX at market price.
     */
    exchange: (params: ExchangeIntentParams) => Promise<ExchangeIntentResult>,
    /**
     * Requests temporary access token for one or more intents that can be used to execute actions without explicit confirmation from the user. In order to be executed implicitly, an implicit flow permissions for a given intent should be granted and "pubkey" parameter set.
     */
    implicitFlow: (params: ImplicitFlowIntentParams) => Promise<ImplicitFlowIntentResult>,
    /**
     * Opens account settings window for a given account.
     */
    manageAccount: (params: ManageAccountIntentParams) => Promise<ManageAccountIntentResult>,
    /**
     * Requests execution of several tx intents bundled together. This intent is atomic – a user confirms or rejects all bundled requests at once, with the same account and the same Stellar network.
     */
    batch: (params: BatchIntentParams) => Promise<BatchIntentResult>,
    /**
    * Check whether an implicit session exists for a given intent and pubkey.
    */
    isImplicitSessionAllowed: (intent: string, pubkey: string) => boolean,
    /**
    * Enumerate all currently active implicit sessions.
    */
    listImplicitSessions: () => AlbedoImplicitSessionDescriptor[]
    /**
    * Revoke session permission granted for an account.
    */
    forgetImplicitSession: (pubkey: string) => void,
    /**
    * Generate a random string of characters that can be used as an authorization challenge token.
    */
    generateRandomToken: () => string
}


export interface PublicKeyIntentParams {
    /**
    * Verification token generated by the application (should be unique or random).
    */
    token?: string,
    /**
    * Optional URL callback where Zingy  will POST a signed token and public key.
    */
    callback?: string,
    /**
    * Allow existing Zingy  accounts only.
    */
    require_existing?: boolean
}

export interface PublicKeyIntentResult {
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * HEX-encoded authentication message derived from the public key and verification token.
    */
    signed_message: string,
    /**
    * HEX-encoded ED25519 signature of the authentication message that can be further used to verify user's keypair ownership.
    */
    signature: string
}

export interface SignMessageIntentParams {
    /**
    * Text message to sign.
    */
    message: string,
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Optional URL callback where Zingy  will POST a signed message.
    */
    callback?: string
}

export interface SignMessageIntentResult {
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Text message to sign from request.
    */
    original_message: string,
    /**
    * HEX-encoded message derived from the public key and original message.
    */
    signed_message: string,
    /**
    * HEX-encoded ED25519 signature of the signed message.
    */
    message_signature: string
}

export interface TxIntentParams {
    /**
    * XDR-encoded transaction envelope to sign.
    */
    xdr: string,
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Stellar network identifier.
    */
    network?: string,
    /**
    * Optional URL callback where Zingy  will POST the signed transaction XDR instead of submitting it to Horizon.
    */
    callback?: string,
    /**
    * Optional human-friendly short transaction description provided by developers.
    */
    description?: string,
    /**
    * If set, the signed transaction will be submitted to the Horizon server instead of returning it to the application.
    */
    submit?: boolean
}

export interface TxIntentResult {
    /**
    * XDR-encoded transaction envelope from request.
    */
    xdr: string,
    /**
    * HEX-encoded transaction hash.
    */
    tx_hash: string,
    /**
    * XDR-encoded transaction envelope with new signatures.
    */
    signed_envelope_xdr: string,
    /**
    * Stellar network identifier.
    */
    network: string,
    /**
    * Optional response from Horizon if the transaction has been submitted automatically.
    */
    result: object
}

export interface PayIntentParams {
    /**
    * Requested payment amount.
    */
    amount: string,
    /**
    * Payment destination address.
    */
    destination: string,
    /**
    * Asset code (skip for XLM).
    */
    asset_code?: string,
    /**
    * Asset issuer (skip for XLM).
    */
    asset_issuer?: string,
    /**
    * Transaction memo (required for exchanges and some anchors).
    */
    memo?: string,
    /**
    * Transaction memo type.
    */
    memo_type?: string,
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string,
    /**
    * Optional URL callback where Zingy  will POST the signed transaction XDR instead of submitting it to Horizon. 
    */
    callback?: string,
    /**
    * If set, the signed transaction will be submitted to the Horizon server instead of returning it to the application.
    */
    submit?: boolean
}

export interface PayIntentResult {
    /**
    * Payment amount from request.
    */
    amount: string,
    /**
    * Payment destination address from request.
    */
    destination: string,
    /**
    * Asset code from request.
    */
    asset_code: string,
    /**
    * Asset issuer from request.
    */
    asset_issuer: string,
    /**
    * Transaction memo from request.
    */
    memo: string,
    /**
    * Transaction memo type from request.
    */
    memo_type: string,
    /**
    * HEX-encoded transaction hash.
    */
    tx_hash: string,
    /**
    * XDR-encoded transaction envelope with new signatures.
    */
    signed_envelope_xdr: string,
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Stellar network identifier.
    */
    network: string,
    /**
    * Optional response from Horizon if the transaction has been submitted automatically.
    */
    result: object
}

export interface TrustIntentParams {
    /**
    * Trustline asset code.
    */
    asset_code: string,
    /**
    * Trustline asset issuer address.
    */
    asset_issuer: string,
    /**
    * Trust limit.
    */
    limit?: string,
    /**
    * Transaction memo (required for exchanges and some anchors).
    */
    memo?: string,
    /**
    * Transaction memo type.
    */
    memo_type?: string,
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string,
    /**
    * Optional URL callback where Zingy  will POST the signed transaction XDR instead of submitting it to Horizon. 
    */
    callback?: string,
    /**
    * If set, the signed transaction will be submitted to the Horizon server instead of returning it to the application.
    */
    submit?: boolean
}

export interface TrustIntentResult {
    /**
    * Trustline asset code from request.
    */
    asset_code: string,
    /**
    * Trustline asset issuer address from request.
    */
    asset_issuer: string,
    /**
    * Trust limit from request.
    */
    limit: string,
    /**
    * HEX-encoded transaction hash.
    */
    tx_hash: string,
    /**
    * XDR-encoded transaction envelope with new signatures.
    */
    signed_envelope_xdr: string,
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Stellar network identifier.
    */
    network: string,
    /**
    * Optional response from Horizon if the transaction has been submitted automatically.
    */
    result: object
}

export interface ExchangeIntentParams {
    /**
    * The amount of asset to buy.
    */
    amount: string,
    /**
    * Maximum price the user willing to pay.
    */
    max_price: string,
    /**
    * Asset code of the asset to sell.
    */
    sell_asset_code?: string,
    /**
    * Issuer account of the asset to sell.
    */
    sell_asset_issuer?: string,
    /**
    * Asset code of the asset to buy.
    */
    buy_asset_code?: string,
    /**
    * Issuer account of the asset to buy.
    */
    buy_asset_issuer?: string,
    /**
    * Transaction memo (required for exchanges and some anchors).
    */
    memo?: string,
    /**
    * Transaction memo type.
    */
    memo_type?: string,
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string,
    /**
    * Optional URL callback where Zingy  will POST the signed transaction XDR instead of submitting it to Horizon.
    */
    callback?: string,
    /**
    * If set, the signed transaction will be submitted to the Horizon server instead of returning it to the application.
    */
    submit?: boolean
}

export interface ExchangeIntentResult {
    /**
    * The amount of asset to buy from request.
    */
    amount: string,
    /**
    * Maximum price the user willing to pay from request.
    */
    max_price: string,
    /**
    * Asset code of the asset to sell from request.
    */
    sell_asset_code: string,
    /**
    * Issuer account of the asset to sell from request.
    */
    sell_asset_issuer: string,
    /**
    * Asset code of the asset to buy from request.
    */
    buy_asset_code: string,
    /**
    * Issuer account of the asset to buy from request.
    */
    buy_asset_issuer: string,
    /**
    * HEX-encoded transaction hash.
    */
    tx_hash: string,
    /**
    * XDR-encoded transaction envelope with new signatures.
    */
    signed_envelope_xdr: string,
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Stellar network identifier.
    */
    network: string,
    /**
    * Optional response from Horizon if the transaction has been submitted automatically.
    */
    result: object
}

export interface ImplicitFlowIntentParams {
    /**
    * Requested implicit flow intents.
    */
    intents: string|string[],
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string
}

export interface ImplicitFlowIntentResult {
    /**
    * Whether a user granted permissions or not.
    */
    granted: boolean,
    /**
    * Requested implicit flow intents.
    */
    intents: string[],
    /**
    * Implicit flow intents that have been granted.
    */
    grants: string[],
    /**
    * Unique implicit session id.
    */
    session: string,
    /**
    * Session expiration timestamp.
    */
    valid_until: number,
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Stellar network identifier.
    */
    network: string
}

export interface ManageAccountIntentParams {
    /**
    * Specific public key requested by the application.
    */
    pubkey: string,
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string
}

export interface ManageAccountIntentResult {
    /**
    * Public key from intent request.
    */
    pubkey: string
}

export interface BatchIntentParams {
    /**
    * Requested tx intents that should be executed together.
    */
    intents: object[],
    /**
    * Specific public key requested by the application.
    */
    pubkey?: string,
    /**
    * Stellar network identifier or private network passphrase.
    */
    network?: string
}

export interface BatchIntentResult {
    /**
    * Requested tx intents.
    */
    intents: object[],
    /**
    * Array of results for each requested intent.
    */
    results: object[],
    /**
    * User-selected public key.
    */
    pubkey: string,
    /**
    * Stellar network identifier.
    */
    network: string
}

export type StellarNetwork = 'public' | 'testnet'

declare const albedo: AlbedoIntent

export default albedo

export interface AlbedoImplicitSessionDescriptor {
    pubkey: string,
    session: string,
    valid_until: number,
    grants: string[]
}

export interface AlbedoIntentInterfaceParamDescriptor {
    description: string,
    required: boolean,
    type?: any
}

export interface AlbedoIntentInterfaceDescriptor {
    risk: 'low' | 'medium' | 'high',
    title: string,
    description: string,
    unsafe: boolean,
    implicitFlow: boolean,
    params: Record<string, AlbedoIntentInterfaceParamDescriptor>,
    returns: string[]
}

export const intentInterface: Record<string, AlbedoIntentInterfaceDescriptor>

export interface AlbedoIntentErrorDescriptor {
    message: string,
    code: number
}

export const intentErrors: Record<string, AlbedoIntentErrorDescriptor>
