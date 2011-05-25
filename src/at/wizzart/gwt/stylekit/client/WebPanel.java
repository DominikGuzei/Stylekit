/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 */

package at.wizzart.gwt.stylekit.client;

import at.wizzart.gwt.widgets.client.CodeMirror;
import at.wizzart.gwt.widgets.client.CodeMirrorConfiguration;
import at.wizzart.gwt.widgets.client.WebView;

import com.google.gwt.event.logical.shared.InitializeEvent;
import com.google.gwt.event.logical.shared.InitializeHandler;
import com.google.gwt.user.client.ui.SimplePanel;
import com.google.gwt.user.client.ui.VerticalSplitPanel;

/**
 * A simple view composite that provides public access
 * to its child views. This is mainly used to split up
 * the interface in manageable peaces.
 * 
 * provides and sets up the web panel with the WebView and
 * html source editor.
 * 
 * @author dominikguzei
 * @version 1.0
 */

public class WebPanel extends SimplePanel {

	public WebView webPreview; // WebView that displays the loaded source code
	public CodeMirror sourceEditor; // Editor to change the source code directly
	private CodeMirrorConfiguration sourceConfig; // config for source editor (html mixed)
	public VerticalSplitPanel splitPanel;
	
	public WebPanel() {
		super();

		webPreview = new WebView();
		webPreview.setWidth("100%");
		webPreview.setHeight("100%");
		sourceConfig = new CodeMirrorConfiguration();
		sourceConfig.setTextWrapping(false);
		sourceConfig.setReindentOnLoad(true);
		sourceEditor = new CodeMirror(sourceConfig);
		sourceEditor.addInitializeHandler(new InitializeHandler() {
			public void onInitialize(InitializeEvent event) {
				sourceEditor.setParser(CodeMirror.PARSER_HTML_MIXED);
			}
		});
		sourceEditor.setWidth("100%");
		sourceEditor.setHeight("100%");
		splitPanel = new VerticalSplitPanel();
		splitPanel.setWidth("100%");
		splitPanel.setHeight("100%");
		splitPanel.add(webPreview);
		splitPanel.add(sourceEditor);

		add(splitPanel);
		setHeight("100%");
		setWidth("100%");
	}
}
