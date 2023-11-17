using backend.Controllers;
using backend.Game;

namespace backend.Models
{

    public struct PlayerNames
    {
        public string white { get; set; }
        public string black { get; set; }
    }

    public class GameState
    {
        public string _gameId { get; set; }
        public int _fieldDimensions { get; set; }
        public PlayerNames _playerNames { get; set; }
        public History _history { get; set; }
        public Pieces _pieces { get; set; }
        public string _currentPlayer { get; set; }
        public bool _gameOver { get; set; }
        public bool _draw { get; set; }
        public int _permissionRequest { get; set; }
    }
}
