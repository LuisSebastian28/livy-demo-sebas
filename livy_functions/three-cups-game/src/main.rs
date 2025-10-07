use clap::Parser;
use serde::{Deserialize, Serialize};
use std::process;

#[derive(Serialize, Deserialize, Debug)]
struct GameResult {
    user_guess: usize,
    ball_position: usize,
    won: bool,
    timestamp: String,
}

#[derive(Parser)]
#[command(name = "three-cups-game")]
#[command(about = "Three Cups Game - Logic Verification")]
struct Args {
    /// User's selected cup position (0, 1, or 2)
    #[arg(long)]
    guess: usize,  // ← ESTE ES EL INPUT (igual que --symbol en price feed)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Three Cups Game - Logic Verification");

    let args = Args::parse();

    // Validar input (0, 1, o 2)
    if args.guess > 2 {
        eprintln!("Error: Cup position must be 0, 1, or 2");
        process::exit(1);
    }

    println!("User selected cup: {}", args.guess);

    // Lógica del juego
    let ball_position = generate_ball_position();
    let won = args.guess == ball_position;

    // Resultado
    let result = GameResult {
        user_guess: args.guess,
        ball_position,
        won,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };

    // Mostrar resultado
    println!("\nGAME RESULT:");
    println!("User guess: {}", result.user_guess);
    println!("Ball position: {}", result.ball_position);
    println!("Result: {}", if result.won { "WINNER! 🎉" } else { "Try again! 😔" });

    // JSON output para Livy
    println!("\nJSON Output:");
    println!("{}", serde_json::to_string_pretty(&result)?);

    println!("\nGame verification completed!");

    Ok(())
}

fn generate_ball_position() -> usize {
    use std::time::{SystemTime, UNIX_EPOCH};
    let seed = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    (seed % 3) as usize
}