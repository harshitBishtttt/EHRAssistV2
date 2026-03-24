package patterns;

public class Square {
    static void printSquareOn(int row, int column) {
        int i = 1, mult = row * column;
        while (i <= mult) {
            //System.out.print("* ");
            if (i % column == 0) {
                //System.out.println();
            }
            i++;
        }
    }

    static void printSquareO2(int row, int column) {
        int i = 0;
        while (i < row) {
            int j = 0;
            while (j < column) {
               // System.out.print("* ");
                j++;
            }
           // System.out.println();
            i++;
        }
    }

    public static void main(String arg[]) {
        long timeOn = System.currentTimeMillis();
        printSquareOn(400, 60);
        System.out.println(System.currentTimeMillis() - timeOn + " linear time complexity");
        long timeO2 = System.currentTimeMillis();
        printSquareO2(400, 60);
        System.out.println(System.currentTimeMillis() - timeO2 + "n square time taken");
    }
}
