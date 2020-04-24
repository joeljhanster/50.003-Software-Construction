f = open("output.txt", "a")
# for i in range (201,301):
#     line = '(cd stresstest && node stresstest{}.js)'.format(i)
#     f.write(line)
#     f.write(' & ')

for i in range(1,29):
    line = "'agent{}', ".format(i)
    f.write(line)
for i in range(54,77):
    line = "'agent{}', ".format(i)
    f.write(line)
for i in range(102,126):
    line = "'agent{}', ".format(i)
    f.write(line)

f.close()