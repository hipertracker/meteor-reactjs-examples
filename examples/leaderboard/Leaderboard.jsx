Players = new Meteor.Collection('players');

if (Meteor.isClient) {
    Meteor.startup(() => React.render(<Leaderboard/>, document.getElementById('outer')));
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
    Meteor.startup(() => {
        if (!Players.find().count()) {
            var names = [
                'Ada Lovelace',
                'Grace Hopper',
                'Marie Curie',
                'Carl Friedrich Gauss',
                'Nikola Tesla',
                'Claude Shannon'
            ];
            names.forEach((name) => {
                Players.insert({name: name, score: Math.floor(Random.fraction() * 10) * 5});
            });
        }
    });
}

var Leaderboard = React.createClass({
    mixins: [ReactMeteor.Mixin],


    getMeteorState() {
        var selectedPlayer = Players.findOne(Session.get("selected_player"));
        return {
            players: Players.find({}, {sort: {score: -1, name: 1}}).fetch(),
            selectedPlayer: selectedPlayer,
            selectedName: selectedPlayer && selectedPlayer.name
        };
    },

    addFivePoints() {
        Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },

    selectPlayer(id) {
        Session.set("selected_player", id);
    },

    renderPlayer(model) {
        var _id = this.state.selectedPlayer && this.state.selectedPlayer._id;
        return (
            <Player
                key={model._id}
                name={model.name}
                score={model.score}
                className={model._id === _id ? "selected" : ""}
                onClick={this.selectPlayer.bind(this, model._id)}
                />
        )
    },

    render() {
        if (!this.state.players.length) {
            return <span/>;
        }
        var children = [
            <div className="leaderboard" key="leaderboard">
                { this.state.players.map(this.renderPlayer) }
            </div>
        ];

        if (this.state.selectedName) {
            children.push(
                <div className="details" key="details">
                    <div className="name">{this.state.selectedName}</div>
                    <input
                        type="button"
                        value="Give 5 points"
                        onClick={this.addFivePoints}
                        />
                </div>
            );

        } else {
            children.push(
                <div className="none" key="notice">Click a player to select</div>
            );
        }

        return <div>{ children }</div>;
    }
});

Player = React.createClass({
    render() {
        var {name, score, className, ...other} = this.props;
        var classes = classNames({
            player: true,
            selected: className
        });
        return (
            <div {...other} className={classes}>
                <span className="name">{name}</span>
                <span className="score">{score}</span>
            </div>
        );
    }
});

