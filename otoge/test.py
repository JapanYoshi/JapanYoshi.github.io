import math
log = open("log.txt", "w+")
side = {0: "-100%", 1: "0"}

def iter(n):
    log.write("@keyframes anim" + str(n) + "d {\n")
    for i in range(n+1):
        val_from = math.floor(10000 * i / n)
        val_to = math.ceil(10000 * i / n)
        if val_to == val_from:
            val_from -= 1
        if i != 0:
            log.write(\
            str(0.01 * val_from) +\
            "%{background-position:" +\
            side[(i - 1) % 2] + " " +\
            str((i - 1) * -100) + "%}\n")
        if i != n:
            log.write(\
            str(0.01 * val_to) +\
            "%{background-position:" +\
            side[i % 2] + " " +\
            str(i * -100) + "%}\n")
    log.write("}\n")

iter(6)
iter(7)
iter(11)