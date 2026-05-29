pub mod db_manager;
pub mod window_state;

use specta_typescript::Typescript;
use std::sync::Arc;
use tauri::ipc::Channel;
use tauri::Manager;
use tauri_specta::{collect_commands, collect_events, Builder};
use window_state::WindowStateManager;

use crate::db_manager::SharedConfig;

#[tauri::command]
#[specta::specta]
fn greet(name: String) -> String {
  format!("Hello, {}!", name)
}

#[tauri::command]
#[specta::specta]
fn test_channel(on_event: Channel<String>) {
  // channel test, send events back to frontend
  // send a string back to frontend
  // useless function, just for testing
  on_event.send("testing".to_string()).unwrap();
}

#[tauri::command]
#[specta::specta]
fn get_config(key: String, config: tauri::State<'_, SharedConfig>) -> Option<String> {
  config.lock().ok()?.get(&key).map(|s| s.to_string())
}

#[tauri::command]
#[specta::specta]
fn set_config(key: String, value: String, config: tauri::State<'_, SharedConfig>) {
  let mut cfg = match config.lock() {
    Ok(c) => c,
    Err(_) => return,
  };
  cfg.set(&key, value);
  cfg.save();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let builder = Builder::<tauri::Wry>::new()
    // Then register them (separated by a comma)
    .commands(collect_commands![greet, test_channel, get_config, set_config])
    .events(collect_events![]);
  #[cfg(debug_assertions)] // <- Only export on non-release builds
  builder
    .export(Typescript::default(), "../src/bindings.ts")
    .expect("Failed to export typescript bindings");
  tauri::Builder::default()
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(builder.invoke_handler())
    .setup(move |app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Mount events using the moved builder
      builder.mount_events(app);

      // Shared JSON config
      let config = db_manager::init_db(app.handle()).expect("Failed to initialise config");

      // Expose config to Tauri commands (get_config / set_config)
      app.manage(Arc::clone(&config));

      // Window state manager — restore on startup, save on close
      let window_state_manager = WindowStateManager::new(config);
      app.manage(window_state_manager);
      if let Some(main_window) = app.get_webview_window("main") {
        app.state::<WindowStateManager>().restore(&main_window);
      }
      window_state::register_save_on_close(app.handle());

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
