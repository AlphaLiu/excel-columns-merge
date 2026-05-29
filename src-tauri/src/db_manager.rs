use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

#[cfg(target_os = "macos")]
use tauri::Manager;
use tauri::AppHandle;

/// Thread-safe handle to the shared JSON config file
pub type SharedConfig = Arc<Mutex<ConfigFile>>;

/// Key-value config stored as a single JSON file.
pub struct ConfigFile {
  path: PathBuf,
  data: HashMap<String, String>,
}

impl ConfigFile {
  fn load_from(path: &PathBuf) -> Self {
    let data = match fs::read_to_string(path) {
      Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
      Err(_) => HashMap::new(),
    };
    Self { path: path.clone(), data }
  }

  /// Persist current in-memory data to disk.
  pub fn save(&self) {
    if let Ok(content) = serde_json::to_string_pretty(&self.data) {
      let _ = fs::write(&self.path, content);
    }
  }

  pub fn get(&self, key: &str) -> Option<&str> {
    self.data.get(key).map(|s| s.as_str())
  }

  pub fn set(&mut self, key: &str, value: String) {
    self.data.insert(key.to_string(), value);
  }

  /// Set multiple keys at once — batch before calling `.save()`.
  pub fn set_batch(&mut self, entries: &[(&str, &str)]) {
    for &(k, v) in entries {
      self.data.insert(k.to_string(), v.to_string());
    }
  }
}

/// Initialises the config JSON file at the same path app.db would have been.
/// macOS: ~/Library/Application Support/<bundle-id>/app.json
/// Windows: next to the executable / app.json
pub fn init_db(app: &AppHandle) -> Result<SharedConfig, String> {
  let path = get_config_path(app)?;

  // Ensure parent directory exists
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent)
      .map_err(|e| format!("Failed to create config directory {:?}: {}", parent, e))?;
  }

  let config = ConfigFile::load_from(&path);
  log::info!("Config initialised at {:?}", path);

  Ok(Arc::new(Mutex::new(config)))
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
  // macOS: use app data directory to survive app updates
  // Windows: use executable directory for portable behavior
  #[cfg(target_os = "macos")]
  {
    let data_dir = app
      .path()
      .app_data_dir()
      .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    Ok(data_dir.join("app.json"))
  }

  #[cfg(not(target_os = "macos"))]
  {
    let _ = app;
    let exe = std::env::current_exe()
      .map_err(|e| format!("Failed to get exe path: {}", e))?;
    let dir = exe.parent().ok_or("Failed to get exe directory")?;
    Ok(dir.join("app.json"))
  }
}
