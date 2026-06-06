set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/.pids"

if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    source "$ROOT_DIR/.env"
    set +a
    echo -e "${GREEN}[ENV]${NC} Loaded .env file"
else
    echo -e "${RED}[WARN]${NC} No .env file found. Copy .env.example to .env"
fi
mkdir -p "$LOG_DIR" "$PID_DIR"

SERVICES=(
    "user-auth-service:8081"
    "api-gateway:8080"
    "marketplace-service:8082"
    "farm-management-service:8083"
    "advisory-service:8084"
    "media-service:8085"
)

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'



start_service() {
    local name=$1
    local port=$2
    local jar="$ROOT_DIR/$name/target/$name-1.0.0.jar"
    local log="$LOG_DIR/$name.log"
    local pid_file="$PID_DIR/$name.pid"

    if [ ! -f "$jar" ]; then
        echo -e "${RED}[ERROR]${NC} JAR not found for $name."
        return 1
    fi

    if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo -e "${YELLOW}[SKIP]${NC}  $name already running"
        return 0
    fi

    echo -e "${CYAN}[START]${NC} Starting $name on port $port..."

    env JWT_SECRET="$JWT_SECRET" \
        MAIL_USERNAME="$MAIL_USERNAME" \
        MAIL_PASSWORD="$MAIL_PASSWORD" \
        AT_API_KEY="$AT_API_KEY" \
        MINIO_ACCESS_KEY="$MINIO_ACCESS_KEY" \
        MINIO_SECRET_KEY="$MINIO_SECRET_KEY" \
        OPENWEATHER_API_KEY="$OPENWEATHER_API_KEY" \
        MPESA_CONSUMER_KEY="$MPESA_CONSUMER_KEY" \
        MPESA_CONSUMER_SECRET="$MPESA_CONSUMER_SECRET" \
        MPESA_SHORTCODE="$MPESA_SHORTCODE" \
        MPESA_PASSKEY="$MPESA_PASSKEY" \
        MPESA_CALLBACK_URL="$MPESA_CALLBACK_URL" \
    nohup java $JAVA_OPTS \
        -jar "$jar" \
        --server.port="$port" \
        > "$log" 2>&1 &

    echo $! > "$pid_file"
    echo -e "${GREEN}[OK]${NC}    $name started (PID $!)"
}

stop_service() {
    local name=$1
    local pid_file="$PID_DIR/$name.pid"

    if [ -f "$pid_file" ]; then
        local pid
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm "$pid_file"
            echo -e "${GREEN}[STOPPED]${NC} $name (PID $pid)"
        else
            echo -e "${YELLOW}[WARN]${NC} $name was not running"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}[WARN]${NC} No PID file found for $name"
    fi
}

show_status() {
    echo -e "\n${CYAN}AgriConnect Service Status${NC}"
    echo "..."
    printf "%-35s %-8s %-10s\n" "Service" "Port" "Status"
    echo "..."

    for entry in "${SERVICES[@]}"; do
        local name="${entry%%:*}"
        local port="${entry##*:}"
        local pid_file="$PID_DIR/$name.pid"

        if [ -f "$pid_file" ] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
            printf "%-35s %-8s ${GREEN}%-10s${NC}\n" "$name" "$port" "RUNNING"
        else
            printf "%-35s %-8s ${RED}%-10s${NC}\n" "$name" "$port" "STOPPED"
        fi
    done
    echo ""
}

tail_logs() {
    local log_files=()
    for entry in "${SERVICES[@]}"; do
        local name="${entry%%:*}"
        log_files+=("$LOG_DIR/$name.log")
    done
    echo -e "${CYAN}Tailing all service logs (Ctrl+C to stop)...${NC}\n"
    tail -f "${log_files[@]}" 2>/dev/null
}


case "${1:-start}" in
    start)
        echo -e "\n${CYAN}Starting AgriConnect services...${NC}\n"
        for entry in "${SERVICES[@]}"; do
            name="${entry%%:*}"
            port="${entry##*:}"
            start_service "$name" "$port"
            sleep 1
        done
        echo -e "\n${GREEN}All services started!${NC}"
        echo -e "Gateway available at: ${CYAN}http://localhost:8080${NC}\n"
        ;;

    stop)
        echo -e "\n${CYAN}Stopping AgriConnect services...${NC}\n"
        for entry in "${SERVICES[@]}"; do
            name="${entry%%:*}"
            stop_service "$name"
        done
        echo -e "\n${GREEN}All services stopped.${NC}\n"
        ;;

    restart)
        "$0" stop
        sleep 2
        "$0" start
        ;;

    status)
        show_status
        ;;

    logs)
        tail_logs
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac