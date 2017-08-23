var fsm = StateMachine.create({
    initial: 'millennium',
    events: [
        { name: 'x-wing', from: 'millennium', to: 'x-wing' },
        { name: 'a-wing', from: ['millennium', 'x-wing', 'tiefighter'], to: 'a-wing' },
        { name: 'tiefighter', from: ['millennium', 'x-wing', 'a-wing'], to: 'tiefighter' }
    ]
});

var switchShips = function () {
    $('#selectedShip').attr('src', fsm.current);
}
