OPTIONS_DEBUG= -Wall -ggdb -g3 -lSDL2 -lm
OPTIONS_RELEASE=-O3 -Wall -s -lSDL2 -lm
OPTIONS=$(OPTIONS_RELEASE)

all : AIware

AIware : aiware.o
	gcc aiware.o $(OPTIONS) -o AIware

aiware.o : aiware.c
	gcc -g $(OPTIONS) -c aiware.c

clean : 
	rm -rf *.o AIware

valgrind :
	valgrind -v --track-origins=yes --leak-check=full --gen-suppressions=yes --show-leak-kinds=all AIware 0 0 0 1 6 5 5 5 4 4 4 4 0 5 5

test :
	./AIware 1 0 0 1 1 1 1 3 1 1 1 0 0 0 0
