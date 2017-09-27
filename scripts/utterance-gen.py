#!/usr/bin/python

# [un]comment as needed:

nouns = ["aircraft", "craft", "airplanes", "planes"]
#nouns = ["helicopters", "choppers"]
#nouns = ["jets", "jet planes", "jet airplanes", "jet aircraft", "jet craft"]
#nouns = ["military aircraft", "military planes", "military craft", "military airplanes"]

places = ["nearby", "near me", "close by", "close", "close to me", "around"]
#places = ["overhead", "above me", "over me", "flying over"]

places = ["flying over"]

for n in nouns:
    for p in places:
        print("\"what %s is %s\"," % (n, p))
        print("\"are there %s %s\"," % (n, p))
        print("\"are there any %s %s\"," % (n, p))