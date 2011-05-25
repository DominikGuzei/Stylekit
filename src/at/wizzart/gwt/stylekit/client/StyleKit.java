/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 */

package at.wizzart.gwt.stylekit.client;
import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.GWT;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.event.dom.client.KeyCodes;
import com.google.gwt.event.dom.client.KeyUpEvent;
import com.google.gwt.event.dom.client.KeyUpHandler;
import com.google.gwt.event.logical.shared.InitializeEvent;
import com.google.gwt.event.logical.shared.InitializeHandler;
import com.google.gwt.event.logical.shared.ResizeEvent;
import com.google.gwt.event.logical.shared.ResizeHandler;
import com.google.gwt.event.logical.shared.ValueChangeEvent;
import com.google.gwt.event.logical.shared.ValueChangeHandler;
import com.google.gwt.http.client.Request;
import com.google.gwt.http.client.RequestBuilder;
import com.google.gwt.http.client.RequestCallback;
import com.google.gwt.http.client.RequestException;
import com.google.gwt.http.client.Response;
import com.google.gwt.http.client.UrlBuilder;
import com.google.gwt.user.client.History;
import com.google.gwt.user.client.Timer;
import com.google.gwt.user.client.Window;
import com.google.gwt.user.client.ui.HorizontalSplitPanel;
import com.google.gwt.user.client.ui.RootPanel;
import com.google.gwt.user.client.ui.VerticalPanel;
import com.google.gwt.xml.client.Document;
import com.google.gwt.xml.client.XMLParser;
import com.google.gwt.http.client.URL;

/**
 * This is the main StyleKit application which controls
 * the interface and server requests. It handles user
 * input and the overall flow of the application.
 * 
 * It certainly should be splitted up into smaller parts
 * and this will be required for future releases that
 * support more features.
 * 
 * defines the entry point for the StyleKit application
 * 
 * @author dominikguzei
 * @version 1.0
 */
public class StyleKit implements EntryPoint {

	/**
	 * Url to the php proxy that serves up requested websites.
	 * Ddd the url of any website to this string and send it as
	 * GET request. The response is the fetched source of the website,
	 * modified by php to change all links to same origin.
	 */
	private static final String SERVICE_GET_EXTERN = GWT.getHostPageBaseURL()+"extern.php?site=";
	
	/**
	 * base url for project folder
	 */
	private static final String SERVICE_GET_PROJECT = GWT.getHostPageBaseURL() + "projects/";
	
	/**
	 * projects service - send POST data to save and create projects
	 */
	private static final String SERVICE_POST_PROJECT = GWT.getHostPageBaseURL() + "projects.php";
	
	/**
	 * css service used to download the css of current project
	 */
	protected static final String SERVICE_GET_CSS = GWT.getHostPageBaseURL() + "css.php?id=";
	
	/**
	 * url to the welcome page of StyleKit
	 */
	private static final String WELCOME_PAGE = GWT.getHostPageBaseURL() + "Welcome.html";
	
	/**
	 * url to the page that gets displayed on same origin problems (when the sandbox is left)
	 */
	private static final String SAME_ORIGIN_PROBLEM_PAGE = GWT.getHostPageBaseURL() + "SameOriginProblem.html";
	
	/**
	 * url to the page that gets displayed when the user enters a project id that doesn't exist
	 */
	private static final String PROJECT_NOT_FOUND_PAGE = GWT.getHostPageBaseURL() + "ProjectNotFound.html";
	
	/**
	 * id that gets added to the injected firebug script tag
	 */
	private static final String FIREBUG_SCRIPT_ID = "stylekit-firebugScript";
	
	/**
	 * path to firebug lite js file on local server
	 */
	private static final String FIREBUG_PATH = GWT.getHostPageBaseURL() + "js/firebug-lite.js";

	/**
	 * the frequency of auto reloading the project
	 */
	protected static final int AUTO_RELOADING_DELAY = 3000;
	
	/**
	 * the time the application waits until it shows the same origin problem page
	 */
	protected static final int SAME_ORIGIN_TIMEOUT = 5000;
	
	/**
	 * indicates if firebug is already added to the current website
	 */
	private boolean firebugAdded = false;
	
	private VerticalPanel appPanel; // application panel that splits the screen in menubar and app
	private NavigationPanel navPanel; // menu bar panel
	private HorizontalSplitPanel splitter; // splits the css and web area horizontally
	private CssPanel cssPanel; // css editor
	private WebPanel webPanel; // displays web preview source view and controls
	private boolean cssEditorLoaded = false;
	private boolean sourceEditorLoaded = false;
	private String projectId = ""; // the project id we are currently using
	private boolean watchMode = false; // indicates if we enabled watch mode (realtime watching)
	private Timer watchTimer; // the timer used to fetch the project details frequently
	
	/**
	 * this is the entry point of the application called by GWT on startup
	 */
	public void onModuleLoad() {
		
		initUi();
		initHandlers();
		
	}

	/**
	 * initialize all panels and setup the main application structure
	 */
	public void initUi() {
		
		navPanel = new NavigationPanel();
		navPanel.setWidth("100%");
		
		cssPanel = new CssPanel();
		cssPanel.setWidth("100%");
		cssPanel.setHeight("100%");
		
		webPanel = new WebPanel();
		webPanel.setWidth("100%");
		webPanel.setHeight("100%");
		
		splitter = new HorizontalSplitPanel();
		splitter.add(cssPanel);
		splitter.add(webPanel);
		splitter.setSplitPosition("25%");
		splitter.setWidth("100%");
		splitter.setHeight("100%");
		
		appPanel = new VerticalPanel();
		appPanel.add(navPanel);
		appPanel.add(splitter);
		appPanel.setCellHeight(splitter, "99%");
		
		RootPanel.get().add(appPanel);
		appPanel.setWidth(Window.getClientWidth()-1 + "px");
		appPanel.setHeight(Window.getClientHeight()-1 + "px");
		Window.addResizeHandler(new ResizeHandler() {
			 public void onResize(ResizeEvent event) {
				 appPanel.setHeight(event.getHeight()-1 + "px");
				 appPanel.setWidth(event.getWidth()-1 + "px");
				 splitter.setWidth("100%");
				 splitter.setHeight("100%");
				 webPanel.splitPanel.setSplitPosition("100%");
			 }
		});
		webPanel.splitPanel.setSplitPosition("100%");
	}

	/**
	 * add initialize handlers to both CodeMirror editors and
	 * continue when both were loaded. This has to be done to
	 * get around problems when one instance is not yet initialized.
	 */
	private void initHandlers() {
		
		// add css editor initialization handler
		cssPanel.cssEditor.addInitializeHandler(new InitializeHandler() {
			public void onInitialize(InitializeEvent event) {
				cssEditorLoaded = true;
				if(sourceEditorLoaded) {
					bindUi();
				}
			}
		});
		
		// add source editor initialization handler
		webPanel.sourceEditor.addInitializeHandler(new InitializeHandler() {
			public void onInitialize(InitializeEvent event) {
				sourceEditorLoaded = true;
				if(cssEditorLoaded) {
					bindUi();
				}
			}
		});
	}
	
	/**
	 * When both editor instances are completely loaded we bind
	 * the ui elements together to bring our application to life!
	 */
	public void bindUi() {
		
		// bind changes of the css editor to the web preview
		cssPanel.cssEditor.addValueChangeHandler(new ValueChangeHandler<String>() {
			public void onValueChange(ValueChangeEvent<String> event) {
				if(webPanel.webPreview.isScriptable()) {
					webPanel.webPreview.setStyle(event.getValue());
					if(!watchMode) {
						saveProject();
					}
				}
			}
		});
		
		// this handler gets called every time the iframe src changes
		// either through setUrl() or by the user clicking links.
		webPanel.webPreview.addInitializeHandler(new InitializeHandler() {
			public void onInitialize(InitializeEvent event) {
				if(webPanel.webPreview.isScriptable()) {
					// proof if the iframe is still on the same origin
					// to be able to change styles and content
					
						// change the content of the source editor to reflect the website
						webPanel.sourceEditor.setContent(webPanel.webPreview.getContent());
						
						if(!webPanel.webPreview.getStyle().isEmpty()) {
							cssPanel.cssEditor.setContent(cssPanel.cssEditor.getContent() + webPanel.webPreview.getStyle());
						}
						// insert the existing styles in the css editor
						webPanel.webPreview.setStyle(cssPanel.cssEditor.getContent());
						
						// get current url and insert it into the url-bar
						String url = webPanel.webPreview.getUrl();
						int urlStart = url.indexOf("=");
						url = url.substring(urlStart+1);
						navPanel.urlInput.setText(URL.decode(url)); // show normal urls
						
						// if we are not in watch mode save the project
						if(!watchMode) {
							saveProject();
						}
						
						// add firebug when activated
						if(navPanel.firebugBtn.isDown()) {
							addFirebug();
						}
						
						// change the title to reflect the current project and url
						Window.setTitle("StyleKit project " + projectId + ": " + url);
						
				} else {
					
					// if the WebView is not scriptable it could be a same origin problem
					// but we cannot retrieve the url or proof that the website is not on
					// the same origin due to the browser security sandbox. So we setup a
					// timer that waits 5 seconds and then gets the user back into the 
					// sandbox because he probably left it. This is ignored if the WebView
					// is scriptable after 5 seconds.
					
					Timer sameOriginWatcher = new Timer() {
						public void run() {
							// if we are still not scriptable
							if(!webPanel.webPreview.isScriptable()) {
								// if we accidently left the same origin, move the user
								// to a page telling him that this happened.
								webPanel.webPreview.setUrl(SERVICE_GET_EXTERN + SAME_ORIGIN_PROBLEM_PAGE);
							}
						}
					};
					sameOriginWatcher.schedule(SAME_ORIGIN_TIMEOUT);
				}
			}
		});
		
		// bind the load button to change the url of the web preview
		navPanel.loadBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				loadUrl(navPanel.urlInput.getText());
			}
		});
		
		// bind "pressing enter in the url input" to change the url of the web view
		navPanel.urlInput.addKeyUpHandler(new KeyUpHandler() {
			public void onKeyUp(KeyUpEvent event) {
				if(event.getNativeKeyCode() == KeyCodes.KEY_ENTER) {
					loadUrl(URL.encode(navPanel.urlInput.getText()));
				}
			}
		});
		
		// bind the save button to create a new project and save current styles and url
		navPanel.saveBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				createProject();
			}
		});
		
		// bind the reload button to fetch the project details and update the views
		navPanel.reloadBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				if(projectId != "") {
					loadProject(projectId);
				}
			}
		});
		// disable the reload button -> will get enabled if we are viewing a project later
		navPanel.reloadBtn.setEnabled(false); 
		
		// bind autoreload button to setup frequent project fetching to enable
		// "realtime" updates of the project 
		navPanel.autoreloadBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				// enable watch mode
				if(navPanel.autoreloadBtn.isDown()) {
					
					if(projectId != "") {
						watchMode = true;
						watchTimer = new Timer() {
							public void run() {
								loadProject(projectId);
							}
						};
						watchTimer.scheduleRepeating(AUTO_RELOADING_DELAY);
						webPanel.splitPanel.setSplitPosition("100%");
						splitter.setSplitPosition("0%");
					}
				} else { // disable watch mode
					watchTimer.cancel();
					watchMode = false;
					webPanel.splitPanel.setSplitPosition("75%");
					splitter.setSplitPosition("25%");
				}
			}
		});
		// autoreloading is only enabled for projects
		navPanel.autoreloadBtn.setEnabled(false);
		
		// bind firebug button to inject firebug lite into the WebView
		navPanel.firebugBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				if(webPanel.webPreview.isScriptable()) {
					if(navPanel.firebugBtn.isDown() && !firebugAdded) {
						addFirebug();
					} else if(!navPanel.firebugBtn.isDown() && firebugAdded) {
						webPanel.webPreview.reload();
						firebugAdded = false;
					}
				}
			}
		});
		
		// bind the download button to open a window with the css service page
		navPanel.downloadBtn.addClickHandler(new ClickHandler() {
			public void onClick(ClickEvent event) {
				String css = cssPanel.cssEditor.getContent();
				if(!css.isEmpty()) {
					if(!projectId.isEmpty()) {
						Window.open(SERVICE_GET_CSS + projectId, "css", "");
					}
				}
			}
		});
		// is enabled when we are in a project
		navPanel.downloadBtn.setEnabled(false);
		
		// bind changes in the source editor to reflect in the web preview
		webPanel.sourceEditor.addValueChangeHandler(new ValueChangeHandler<String>() {
			public void onValueChange(ValueChangeEvent<String> event) {
				if(webPanel.webPreview.isScriptable() && webPanel.webPreview.getContent() != event.getValue()) {
					webPanel.webPreview.setContent(event.getValue());
				}
			}
		});
		
		// add history buttons support 
		History.addValueChangeHandler(new ValueChangeHandler<String>() {
			public void onValueChange(ValueChangeEvent<String> event) {
				navPanel.urlInput.setText(event.getValue());
				loadUrl(event.getValue());
			}
		});
		
		// start the application with default values
		initApplication();
	
	}
	
	private void addFirebug() {
		// inject firebug lite
		webPanel.webPreview.addScriptTag(
				FIREBUG_SCRIPT_ID, 
				FIREBUG_PATH
		);
		firebugAdded = true;
	}
	
	private void initApplication() {
		// try to fetch project id from url
		String id = com.google.gwt.user.client.Window.Location.getParameter("id");
		
		if(id != null && id != "") {
			loadProject(id); // try to load the project with id
		} else {
			if(!History.getToken().isEmpty()) {
				loadUrl(History.getToken());
			} else {
				loadUrl(WELCOME_PAGE);
			}
		}
	}
	
	public void loadUrl(String url) {
		if( url.length() > 0){
			webPanel.webPreview.setUrl(SERVICE_GET_EXTERN+ url);
			navPanel.urlInput.setText(url);
			History.newItem(url);
		}
	}
	
	/**
	 * This function is used to fetch project data from the server
	 * @param id - project id
	 */
	public void loadProject(String id) {
		//create a new GET request to fetch the project styles
		RequestBuilder builder = new RequestBuilder(RequestBuilder.GET, SERVICE_GET_PROJECT + id + ".xml");
		try {
			//send the request
			builder.sendRequest( null, new RequestCallback(){
				public void onError(Request request, Throwable exception){}
				
				public void onResponseReceived(Request request, Response response){
					//check the status code
					
					int statusCode = response.getStatusCode();
					if( statusCode == 200 || statusCode == 201 ){
						
						//parse response xml file
						Document project = XMLParser.parse(response.getText());
						
						// get the url out of the xml
						if(project.getElementsByTagName("url").item(0).getFirstChild() != null) {
							String url = project.getElementsByTagName("url").item(0).getFirstChild().getNodeValue();
							
							if(!url.isEmpty() && !navPanel.urlInput.getText().equals(url)){
								loadUrl(url); // load the url
							}
						}
						
						// get the id out of the xml
						if(project.getElementsByTagName("id").item(0).getFirstChild() != null) {
							String id = project.getElementsByTagName("id").item(0).getFirstChild().getNodeValue();
							
							if(!id.isEmpty()){
								projectId = id;
							}
						}

						navPanel.reloadBtn.setEnabled(true);
						navPanel.autoreloadBtn.setEnabled(true);
						navPanel.downloadBtn.setEnabled(true);
						
						// get the saved styles out of the xml
						if(project.getElementsByTagName("style").item(0).getFirstChild() != null) {
							String style = project.getElementsByTagName("style").item(0).getFirstChild().getNodeValue();
							//Window.alert(style);
							if(!style.isEmpty() && !style.equals(cssPanel.cssEditor.getContent())){
								cssPanel.cssEditor.setContent(style); // set the styles
							}
						}
						
					}
					if( statusCode == 404) { // project not found
						webPanel.webPreview.setUrl(SERVICE_GET_EXTERN + PROJECT_NOT_FOUND_PAGE);
					}
				}
			});
		}
		catch (RequestException e){  }
	}
	
	/**
	 * Is used to save the current project
	 */
	public void saveProject() {
		
		if(projectId != "") {
			
			//create xml project details
			String project = "<?xml version=\"1.0\" ?><project>";
			project += "<id>" + projectId + "</id>";
			project += "<url><![CDATA[" + URL.encode(navPanel.urlInput.getText()) + "]]></url>";
			project += "<style>" + cssPanel.cssEditor.getContent() + "</style></project>";
			
			//create a new POST request to save the project details
			RequestBuilder builder = new RequestBuilder(RequestBuilder.POST, SERVICE_POST_PROJECT);
			try {
				//send the request
				builder.sendRequest( project, new RequestCallback(){
					public void onError(Request request, Throwable exception){}
					
					public void onResponseReceived(Request request, Response response){
						//check the status code
						int statusCode = response.getStatusCode();
						if( statusCode == 200 ){}
						if( statusCode == 400) { // on bad request
							Window.alert(response.getText());
						}
					}
				});
			}
			catch (RequestException e){  }
		}
	}
	
	/**
	 * is used to create a new project with current css and url
	 * retrieves the created project id from the server and redirects
	 * the browser to a url with project id
	 */
	public void createProject() {

		//create xml project details
		String project = "<?xml version=\"1.0\" ?><project>";
		project += "<url><![CDATA[" + URL.encode(navPanel.urlInput.getText()) + "]]></url>";
		project += "<style>" + cssPanel.cssEditor.getContent() + "</style></project>";
		
		//create a new POST request to save the project details
		RequestBuilder builder = new RequestBuilder(RequestBuilder.POST, SERVICE_POST_PROJECT);
		try {
			//send the request
			builder.sendRequest( project, new RequestCallback(){
				public void onError(Request request, Throwable exception){}
				
				public void onResponseReceived(Request request, Response response){
					//check the status code
					int statusCode = response.getStatusCode();
					if( statusCode == 201 ){
						// created project successfully!
						projectId = response.getText();
						UrlBuilder builder = Window.Location.createUrlBuilder();
						builder.setParameter("id", projectId);
						Window.Location.assign(builder.buildString());
					}
					if( statusCode == 500) { // on bad request
						Window.alert(response.getText());
					}
				}
			});
		}
		catch (RequestException e){  }
	}
	
}
