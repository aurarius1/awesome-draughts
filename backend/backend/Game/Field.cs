namespace backend.Game
{ 
    public class Field
    {
        public Position position { get; set; }
        public bool containsPiece { get; set; } = false;
        public Piece? piece { get; set; } = null;
    }
}
