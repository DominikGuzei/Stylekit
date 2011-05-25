/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 */

package at.wizzart.gwt.stylekit.client;

import at.wizzart.gwt.stylekit.client.resources.StylekitClientBundle;
import at.wizzart.gwt.widgets.client.TooltipListener;

import com.google.gwt.user.client.ui.FlowPanel;
import com.google.gwt.user.client.ui.PushButton;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.TextBox;
import com.google.gwt.user.client.ui.ToggleButton;

/**
 * A simple view composite that provides public access
 * to its child views. This is mainly used to split up
 * the interface in manageable peaces.
 * 
 * Provides and sets up all views in the menu bar.
 * 
 * @author dominikguzei
 * @version 1.0
 */

public class NavigationPanel extends FlowPanel {

	private Image logoImg = new Image(StylekitClientBundle.INSTANCE.logo());
	public PushButton saveBtn = new PushButton(new Image(StylekitClientBundle.INSTANCE.saveUp()));
	public PushButton reloadBtn = new PushButton(new Image(StylekitClientBundle.INSTANCE.reloadUp())); // button to load the url
	public ToggleButton autoreloadBtn = new ToggleButton(new Image(StylekitClientBundle.INSTANCE.autoreloadUp()));
	public TextBox urlInput = new TextBox(); // input the desired url
	public PushButton loadBtn = new PushButton(new Image(StylekitClientBundle.INSTANCE.loadUp()));
	public ToggleButton firebugBtn = new ToggleButton(new Image(StylekitClientBundle.INSTANCE.firebugUp()));
	public PushButton downloadBtn = new PushButton(new Image(StylekitClientBundle.INSTANCE.downloadUp()));
	
	private TooltipListener logoTip = new TooltipListener("StyleKit by <strong>Dominik Guzei</strong> (wizzart.at)<br />QPT 1 project at Fachhochschule Salzburg", 4000);
	private TooltipListener saveTip = new TooltipListener("Save as new project", 2000);
	private TooltipListener reloadTip = new TooltipListener("Reload the current project", 2000);
	private TooltipListener autoreloadTip = new TooltipListener("Toggle realtime auto reloading", 2000);
	private TooltipListener urlTip = new TooltipListener("Any online url here + [ENTER]", 2000);
	private TooltipListener loadTip = new TooltipListener("Load the url", 2000);
	private TooltipListener firebugTip = new TooltipListener("Toggle Firebug Lite", 2000);
	private TooltipListener downloadTip = new TooltipListener("Download your css", 2000);
	
	public NavigationPanel() {
		super();
		
		logoImg.setStyleName("stylekit-logo");
		
		// TOOLTIPS
		logoImg.addMouseOverHandler(logoTip);
		logoImg.addMouseOutHandler(logoTip);
		
		saveBtn.addMouseOverHandler(saveTip);
		saveBtn.addMouseOutHandler(saveTip);
		
		reloadBtn.addMouseOverHandler(reloadTip);
		reloadBtn.addMouseOutHandler(reloadTip);
		
		autoreloadBtn.addMouseOverHandler(autoreloadTip);
		autoreloadBtn.addMouseOutHandler(autoreloadTip);
		
		urlInput.addMouseOverHandler(urlTip);
		urlInput.addMouseOutHandler(urlTip);
		
		loadBtn.addMouseOverHandler(loadTip);
		loadBtn.addMouseOutHandler(loadTip);
		
		firebugBtn.addMouseOverHandler(firebugTip);
		firebugBtn.addMouseOutHandler(firebugTip);
		
		downloadBtn.addMouseOverHandler(downloadTip);
		downloadBtn.addMouseOutHandler(downloadTip);
		
		// HOVER FACES FOR BUTTONS
		saveBtn.setStyleName("stylekit-save");
		saveBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.saveOver()));
		
		reloadBtn.setStyleName("stylekit-reload");
		reloadBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.reloadOver()));
		reloadBtn.getUpDisabledFace().setImage(new Image(StylekitClientBundle.INSTANCE.reloadDisabled()));
		
		autoreloadBtn.setStyleName("stylekit-autoreload");
		autoreloadBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.autoreloadDown()));
		autoreloadBtn.getUpDisabledFace().setImage(new Image(StylekitClientBundle.INSTANCE.autoreloadDisabled()));
		autoreloadBtn.getDownFace().setImage(new Image(StylekitClientBundle.INSTANCE.autoreloadDown()));
		
		
		urlInput.setStyleName("stylekit-urlinput");
		
		loadBtn.setStyleName("stylekit-load");
		loadBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.loadOver()));
		
		firebugBtn.setStyleName("stylekit-firebug");
		firebugBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.firebugDown()));
		firebugBtn.getDownFace().setImage(new Image(StylekitClientBundle.INSTANCE.firebugDown()));
		
		downloadBtn.setStyleName("stylekit-download");
		downloadBtn.getUpHoveringFace().setImage(new Image(StylekitClientBundle.INSTANCE.downloadOver()));
		downloadBtn.getUpDisabledFace().setImage(new Image(StylekitClientBundle.INSTANCE.downloadDisabled()));
		
		add(logoImg);
		add(saveBtn);
		add(reloadBtn);
		add(autoreloadBtn);
		add(urlInput);
		add(loadBtn);
		add(firebugBtn);
		add(downloadBtn);
		setStyleName("gwt-navPanel");
		
	}
}
