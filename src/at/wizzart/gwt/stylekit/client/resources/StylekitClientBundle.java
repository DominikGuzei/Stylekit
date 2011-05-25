/**
 * 	@author Dominik Guzei
 *	Project: StyleKit - Qualifikationsprojekt 1
 *	Fachhochschule Salzburg
 *
 */

package at.wizzart.gwt.stylekit.client.resources;

import com.google.gwt.core.client.GWT;
import com.google.gwt.resources.client.ClientBundle;
import com.google.gwt.resources.client.ImageResource;

/**
 * This Interface provides all image resources used by the application
 * @author dominikguzei
 * @version 1.0
 */

public interface StylekitClientBundle extends ClientBundle {
	public static final StylekitClientBundle INSTANCE = GWT.create(StylekitClientBundle.class);
	
	// logo image resource
	@Source("stylekit_logo.jpg")
	public ImageResource logo();
	
	// save project button
	@Source("stylekit_save.jpg")
	public ImageResource saveUp();
	@Source("stylekit_saveOver.jpg")
	public ImageResource saveOver();

	// reload project button
	@Source("stylekit_reload.jpg")
	public ImageResource reloadUp();
	@Source("stylekit_reloadOver.jpg")
	public ImageResource reloadOver();
	@Source("stylekit_reloadDisabled.jpg")
	public ImageResource reloadDisabled();
	
	// auto-reload project button
	@Source("stylekit_autoreload.jpg")
	public ImageResource autoreloadUp();
	@Source("stylekit_autoreloadOver.jpg")
	public ImageResource autoreloadDown();
	@Source("stylekit_autoreloadDisabled.jpg")
	public ImageResource autoreloadDisabled();
	
	// load url button
	@Source("stylekit_load.jpg")
	public ImageResource loadUp();
	@Source("stylekit_loadOver.jpg")
	public ImageResource loadOver();
	
	// firebug toggle button
	@Source("stylekit_firebugEnabled.jpg")
	public ImageResource firebugDown();
	@Source("stylekit_firebugDisabled.jpg")
	public ImageResource firebugUp();
	
	// download css button
	@Source("stylekit_download.jpg")
	public ImageResource downloadUp();
	@Source("stylekit_downloadOver.jpg")
	public ImageResource downloadOver();
	@Source("stylekit_downloadDisabled.jpg")
	public ImageResource downloadDisabled();
}
