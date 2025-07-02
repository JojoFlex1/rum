from pyteal import *

def approval_program():
    # Global state
    global_creator = Bytes("creator")
    global_fee_rate = Bytes("fee_rate")
    global_total_transactions = Bytes("total_transactions")

    # Operations
    op_payment = Bytes("payment")
    op_update_fee = Bytes("update_fee")

    @Subroutine(TealType.none)
    def payment_txn():
        return Seq([
            # Verify payment amount
            Assert(Gtxn[1].amount() > Int(0)),
            # Update total transactions
            App.globalPut(
                global_total_transactions,
                App.globalGet(global_total_transactions) + Int(1)
            ),
            # Calculate and verify fee
            Assert(
                Gtxn[2].amount() == 
                WideRatio(
                    [Gtxn[1].amount(), App.globalGet(global_fee_rate)],
                    [Int(100)]
                )
            ),
            Approve()
        ])

    @Subroutine(TealType.none)
    def update_fee():
        return Seq([
            # Only creator can update fee
            Assert(Txn.sender() == App.globalGet(global_creator)),
            # New fee rate must be between 0 and 100
            Assert(Btoi(Txn.application_args[1]) <= Int(100)),
            App.globalPut(global_fee_rate, Btoi(Txn.application_args[1])),
            Approve()
        ])

    program = Cond(
        # Handle app creation
        [Txn.application_id() == Int(0), Seq([
            App.globalPut(global_creator, Txn.sender()),
            App.globalPut(global_fee_rate, Int(3)), # 3% default fee
            App.globalPut(global_total_transactions, Int(0)),
            Approve()
        ])],
        # Handle payment
        [Txn.application_args[0] == op_payment, payment_txn()],
        # Handle fee update
        [Txn.application_args[0] == op_update_fee, update_fee()],
    )

    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("payment_approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)

    with open("payment_clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)