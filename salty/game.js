document.body.classList = "state_game_title";
var formatPts = undefined;
/**
 * Changes how winnings are printed.
 * @param {Object} format
 * @param {number} format.multiplier What to multiply the 10 pts per question by.
 * @param {number} format.decimalDigits How many decimal digits to show.
 * @param {string} format.decimalSymbol Decimal point? Decimal comma? Custom define.
 * @param {Array<number>} format.separatorDigits How often to insert the digit separator. 
 * Define from least significant to most significant. Repeats the last entry.
 * To disable set to []. Usually set to [3]. If lakh/crore, set to [3, 2].
 * @param {string} format.separatorSymbol Separator comma? Separator period? Custom define.
 * @param {Array<string>[2]} format.nega Prefix and suffix when the amount is negative.
 * @param {Array<string>[2]} format.zero Prefix and suffix when the amount is zero.
 * @param {Array<string>[2]} format.posi Prefix and suffix when the amount is positive.
 */
function changeFormat(format) {
    formatPts = (value, plus) => {
        var str = Math.floor(
            value * format.multiplier * Math.pow(10, format.decimalDigits)
            ).toString(10);
        digits = str.length;
        if (format.decimalDigits) {
            if (format.decimalDigits >= str.length) {
            digits = format.decimalDigits + 1;
            str = str.padStart(digits, "0");
            }
            digits -= format.decimalDigits;
            str = str.slice(0, digits) + format.decimalSymbol + str.slice(digits);
        }
        if (format.separatorDigits.length) {
            var i = 0;
            while (digits > format.separatorDigits[i]) {
            digits -= format.separatorDigits[i];
            str = str.slice(0, digits) + format.separatorSymbol + str.slice(digits);
            }
        }
        str +=
            value < 0 ? format.nega[1] :
                plus ? (
                    value === 0 ? format.zero[1] : format.posi[1]
                ) : format.noSign[1];
        return value < 0 ? format.nega[0] :
            plus ? (
                value === 0 ? format.zero[0] : format.posi[0]
            ) : format.noSign[0]
        + str;
    }
}