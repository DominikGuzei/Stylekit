/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 */

package at.wizzart.gwt.stylekit.client;

import at.wizzart.gwt.widgets.client.CodeMirror;
import at.wizzart.gwt.widgets.client.CodeMirrorConfiguration;

import com.google.gwt.event.logical.shared.InitializeEvent;
import com.google.gwt.event.logical.shared.InitializeHandler;
import com.google.gwt.user.client.ui.VerticalPanel;

/**
 * A simple view composite that provides public access
 * to its child views. This is mainly used to split up
 * the interface in manageable peaces.
 * 
 * provides and sets up the css editor panel
 * 
 * @author dominikguzei
 * @version 1.0
 */
public class CssPanel extends VerticalPanel {

	public CodeMirror cssEditor; // css editor
	public CodeMirrorConfiguration cssConfig; // configuration for css editor
	
	CssPanel() {
		cssConfig = new CodeMirrorConfiguration();
		cssConfig.setLineNumbers(true);
		cssConfig.setTextWrapping(false);
		
		cssEditor = new CodeMirror(cssConfig);
		cssEditor.addInitializeHandler(new InitializeHandler() {
			public void onInitialize(InitializeEvent event) {
				cssEditor.setParser(CodeMirror.PARSER_CSS);
			}
		});
		cssEditor.setWidth("100%");
		cssEditor.setHeight("100%");

		add(cssEditor);
		setCellHeight(cssEditor, "100%");
	}
}
