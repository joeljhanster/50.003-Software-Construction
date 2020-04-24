

f = open('./delagents.csv', 'a')
for i in range(29,54):
    line = "update;agent{}@sutd.edu.sg;P@ssword123;;;;agent{};;;;;;;;;;true;;;;generalEnquiries;banking;;;;;;;".format(i,i)
    f.write(line)
    f.write("\n")
for i in range(77,102):
    line = "update;agent{}@sutd.edu.sg;P@ssword123;;;;agent{};;;;;;;;;;true;;;;investment;banking;;;;;;;".format(i,i)
    f.write(line)
    f.write("\n")
for i in range(126,151):
    line = "update;agent{}@sutd.edu.sg;P@ssword123;;;;agent{};;;;;;;;;;true;;;;generalEnquiries;investment;;;;;;;".format(i,i)
    f.write(line)
    f.write("\n")
f.close()