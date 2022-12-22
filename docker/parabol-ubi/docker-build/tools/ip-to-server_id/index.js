#! /usr/bin/env node

var args = process.argv.slice(2);

//TODO Check if args > 1 => error as we should receive only 1 arg
//TODO Check if received arg is not an IP (regex DDD.DDD.DDD.DDD with 0 >= DDD >= 255) => error
var ip = process.argv[2];
// Split the IP into 4 parts
var ip_parts = ip.split(".");

// Gets a number, transform it to binary and add leading 0s
function string_number_to_binary(number, binary_digits) {
    return parseInt(number).toString(2).padStart(binary_digits, '0');
}

var first_eigth_bits = string_number_to_binary(ip_parts[2], 8);
var least_eight_bits = string_number_to_binary(ip_parts[3], 8);

var least_ten_bits = first_eigth_bits.concat(least_eight_bits).slice(-10);

var result = parseInt(least_ten_bits, 2);

console.log(result);
