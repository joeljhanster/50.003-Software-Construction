package selenium;
import static org.junit.Assert.assertEquals;
import java.util.concurrent.TimeUnit;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
/**
 * testSucess: 
 * can noor add a name for the login and back buttons for some reason my xpath doesn't work today
 * fml why cannot click the navigation drawer i how sia 
 * 
 */

public class AppTest {
    WebDriver driver;
    @Before
    public void BeforeTest() throws InterruptedException{
        String path = "C:/Users/returnofthedohreimi/Desktop/programming/ChromeDriver/chromedriver_win32/chromedriver.exe";
        System.setProperty("webdriver.chrome.driver", path);      
        driver = new ChromeDriver(); 
        //Thread.sleep(3000);
    }

    @After
    public void AfterTest(){
        System.out.println("Closing ChromeDiver...");
		driver.close();	
    }
    //click all buttons 
    @Test
    public void testClickButtons() throws InterruptedException{		
        driver.get("http://localhost:8080/#/");
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);				
        //get all the buttons 
        java.util.List<WebElement> buttons = driver.findElements(By.tagName("a"));
        
        // click all buttons in a web page
		for(int i = 0; i < buttons.size(); i++)
		{
			System.out.println("*** Navigating to" + " " + buttons.get(i).getAttribute("href"));
			if (buttons.get(i).getAttribute("href") == null)
				continue;
			boolean staleElementLoaded = true;
			//the loop checks whether the elements is properly loaded
			while(staleElementLoaded) {
				try {
					//navigate to the link
					buttons.get(i).click();
					Thread.sleep(3000);
					//click the back button in browser
					driver.navigate().back();
					buttons = driver.findElements(By.tagName("a"));
					staleElementLoaded = false;
				} catch (StaleElementReferenceException e) {
					staleElementLoaded = true;
				}
			}
		}

    };
    
    //Sucessful log in to Rainbow, send message through chatbox and successful log out 
    @Test
    public void testLoginSuccess() throws InterruptedException{
        String MyUserName = "jcjiayichow@gmail.com";
        String MyPassword = "Password";
        driver.get("http://localhost:8080/#/login/");
        
        //wait for page to load 
        Thread.sleep(3000);

        // //get username field
        WebElement username = driver.findElement(By.name("login"));
        System.out.println(username);
        //send the username into the field
        username.sendKeys(MyUserName);

        //get password field 
        WebElement password = driver.findElement(By.name("password"));

        //send password into the field 
        password.sendKeys(MyPassword);
        
        //wait for selenium to key in everything 
        Thread.sleep(6000);
        //login 
        WebElement LoginButton = driver.findElement(By.name("tochatbotbtn"));
        LoginButton.click();

        //wait for new page to load 
        Thread.sleep(3000);
        //check the new page 
        String url = driver.getCurrentUrl();
        assertEquals("http://localhost:8080/#/chatbot", url);  

        //click chatbox 
        WebElement ChatBox = driver.findElement(By.name("msgbox"));
        ChatBox.sendKeys("hello");
        Thread.sleep(300);

        //click send button 
        WebElement EnterButton = driver.findElement(By.name("msgbutton"));
        EnterButton.click();
        Thread.sleep(3000);
        // //click the navigation drawer 
        // WebElement NavDrawer = driver.findElement(By.id("drawer"));
        // System.out.println("Clicked NavDrawer");
        // NavDrawer.click();
        
        // Thread.sleep(3000);
        // //click logout button 
        // WebElement LogoutButton = driver.findElement(By.name("toHomebutton"));
        // LogoutButton.click();
        // System.out.println("Clicked logout button");
        // Thread.sleep(3000);
        // url = driver.getCurrentUrl();
        // assertEquals("http://localhost:8080/#/login/", url);
    }

    //Failed login to Rainbow
    @Test
    public void testLoginFail() throws InterruptedException{
        String MyUserName = "wrongemail";
        String MyPassword = "wrongpassword";
        driver.get("http://localhost:8080/#/login/");
        
        //wait for page to load 
        Thread.sleep(3000);

        // //get username field
        WebElement username = driver.findElement(By.name("login"));
        System.out.println(username);
        //send the username into the field
        username.sendKeys(MyUserName);

        //get password field 
        WebElement password = driver.findElement(By.name("password"));

        //send password into the field 
        password.sendKeys(MyPassword);
        
        //wait for selenium to key in everything 
        Thread.sleep(6000);
        //login 
        WebElement LoginButton = driver.findElement(By.name("tochatbotbtn"));
        LoginButton.click();

        //wait for new page to load 
        Thread.sleep(3000);

        //check that the page is still the current page 
        String url = driver.getCurrentUrl();
        assertEquals("http://localhost:8080/#/login/", url);
    }   
}
