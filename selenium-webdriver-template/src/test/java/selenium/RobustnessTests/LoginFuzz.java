package selenium.RobustnessTests;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Random;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

public class LoginFuzz {
    private final String lower_alphabet = "abcdefghijklmnopqrstuvwxyz";
    private final String numbers = "1234567890";
    private final String symbols = "!@#$%^&*()_{}[];:`~";
    private final ArrayList<String> email = new ArrayList<String>(Arrays.asList("gmail.com", "hotmail.com", "yahoo.com"));
    private int rand_index; 
    Random random = new Random();
    //function to generate random username 
    public String usernamefuzz(){
        String rand_string = "";
        int rand_length = random.nextInt(20);

        for (int i = 0; i < rand_length; i++){
            rand_index = random.nextInt(lower_alphabet.length() - 1);
            rand_string += lower_alphabet.charAt(rand_index);
        }

        //add the @
        rand_string += "@";

        //add a random email 
        rand_index = random.nextInt(email.size() - 1);
        rand_string += email.get(rand_index);
        return rand_string; 
    }

    /** Function to generate random password. The generated password must have the following requirements: 
     * 1. Contains upper and lower case 
     * 2. Contains numbers and symbols 
     * 3. Has at least 8 characters 
      */
    public String passwordfuzz(){
        String rand_string = "";
        //sets minimum password length
        int rand_length = random.nextInt(20) + 8; 

        int rand_symbol_index = random.nextInt(rand_length);
        char rand_symbol = symbols.charAt(random.nextInt(symbols.length()) - 1);

        int rand_upper_index = random.nextInt(rand_length);
        //ensures that they do not replace each other 
        while (rand_upper_index == rand_symbol_index){
            rand_upper_index = random.nextInt(rand_length);
        }
        char rand_upper = lower_alphabet.toUpperCase().charAt(random.nextInt(lower_alphabet.length()) - 1);

        int rand_number_index = random.nextInt(rand_length);
        while (rand_number_index == rand_symbol_index || rand_number_index == rand_upper_index){
            rand_upper_index = random.nextInt(rand_length);
        }
        char rand_number = numbers.charAt(random.nextInt(numbers.length() - 1));


        //generate a lower case string 
        for (int i = 0; i < rand_length; i++){
            rand_index = random.nextInt(lower_alphabet.length() - 1);
            rand_string += lower_alphabet.charAt(rand_index);
        }

        //mutate the string 
        StringBuilder output_string = new StringBuilder(rand_string);
        output_string.setCharAt(rand_upper_index, rand_upper); //add upper case 
        output_string.setCharAt(rand_symbol_index, rand_symbol); //add symbol 
        output_string.setCharAt(rand_number_index, rand_number); //add number 

        rand_string = output_string.toString();
        return rand_string; 
    }

    // function to login using the generated usernames and passwords
    public void InjectionTest(String myUserName, String myPassword) throws InterruptedException {
        String path = "C:/Users/returnofthedohreimi/Desktop/programming/ChromeDriver/chromedriver_win32/chromedriver.exe";
        System.setProperty("webdriver.chrome.driver", path);      
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:8080/#/login");

        Thread.sleep(3000);
        WebElement username = driver.findElement(By.name("login"));
        WebElement password = driver.findElement(By.name("password"));

        username.sendKeys(myUserName);
        username.sendKeys(myPassword);

        Thread.sleep(3000);

        WebElement LoginButton = driver.findElement(By.name("tochatbotbtn"));
        LoginButton.click();

        Thread.sleep(3000);

        driver.close();
    }

    //function to generate 100 invalid usernames and passwords 
    @Test
    public void GenerateCredentials() throws InterruptedException{
        for (int i = 0; i < 100; i++){
            String myUserName = new LoginFuzz().usernamefuzz(); 
            String myPassword = new LoginFuzz().passwordfuzz(); 
            InjectionTest(myUserName, myPassword);
        }
    }

    public static void main(String[] args) throws InterruptedException{
        new LoginFuzz().GenerateCredentials();
    }
}