function numberToWords(amount) {
    if (isNaN(amount)) return "";

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty",
        "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    function convertHundreds(num) {
        let str = "";

        if (num > 99) {
            str += ones[Math.floor(num / 100)] + " Hundred ";
            num %= 100;
        }

        if (num > 19) {
            str += tens[Math.floor(num / 10)] + " ";
            num %= 10;
        }

        if (num > 0) {
            str += ones[num] + " ";
        }

        return str.trim();
    }

    function convert(num) {
        if (num === 0) return "Zero";

        const units = [
            { value: 100000000000, name: "Kharab" },
            { value: 1000000000, name: "Arab" },
            { value: 10000000, name: "Crore" },
            { value: 100000, name: "Lakh" },
            { value: 1000, name: "Thousand" },
            { value: 1, name: "" }
        ];

        let result = "";

        for (const unit of units) {
            if (num >= unit.value) {
                const part = Math.floor(num / unit.value);
                if (unit.value === 1) {
                    result += convertHundreds(part);
                } else {
                    result += convertHundreds(part) + " " + unit.name + " ";
                }
                num %= unit.value;
            }
        }

        return result.trim();
    }

    const [rupees, paise] = amount.toFixed(2).split(".");
    let words = convert(Number(rupees));

    if (Number(paise) > 0) {
        words += " and " + convert(Number(paise)) + " Paise";
    }

    return words + " Only";
}

module.exports = numberToWords;