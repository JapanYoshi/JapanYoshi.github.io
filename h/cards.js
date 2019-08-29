/*
    card encoding:
    0 is null
    value 1 thru K = +1 thru +13
    spade, diamond, club, heart = +0, +16, +32, +48
    black/white joker = 14, colored joker = 15

    table:
        0   1   2   3   ... A   B   C   D   E   F 
    0:  NUL S1  S2  S3      S10 SJ  SQ  SK  JB  JC
    1:      D1  D2  D3      D10 DJ  DQ  DK
    2:      C1  C2  C3      C10 CJ  CQ  CK
    3:      H1  H2  H3      H10 HJ  HQ  HK
    (JB = Joker (black and white), JC = Joker (color))
*/

/*
    card dealing:
    init(players):
        initialize stack with set of 54 cards and number of players
    encrypt(player):
        encrypts player's hand using their key.
    setKey(player, key):
        set cipher key for player.
        should call encrypt(player)
    deal(player):
        pop a random card from the stack and add it to a player's hand.
        should call encrypt(player)
    dealToTable():
        pop a random card from the stack and add it to the table
    receive(player, data):
        receive a card from a player.
        if valid (i.e. card is in player's hand), moves the card from player's hand to deck.
        else, show warning

    player side:
    decrypt(data, key):
        decrypts card data using the key
*/