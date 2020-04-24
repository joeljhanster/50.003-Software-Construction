# for i in range(201,301):
#     fileName = "stresstest{}.js".format(i)
#     f = open(fileName, "a")
#     line = 'stresstest("customer{}@sutd.edu.sg")'.format(i)
#     f.write(line)
#     f.close()

for i in range(1,301):
    fileName = "stresstest{}.js".format(i)
    f = open(fileName, "rt")
    data = f.read()
    data = data.replace("sleep(10000)", "sleep(7000)")
    f.close()

    f = open(fileName, "wt")
    f.write(data)
    f.close()